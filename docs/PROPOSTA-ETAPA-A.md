# Proposta: Etapa (a), cadastros e login

Status: **aguardando aprovação**. Nenhum código do app foi gerado ainda.

## 1. Estrutura de pastas

```
app-movimentacao/
├─ src/
│  ├─ proxy.ts                      # renova a sessão e bloqueia quem não está logado (Next.js 16)
│  ├─ app/
│  │  ├─ entrar/                    # e-mail → código de 6 dígitos
│  │  ├─ auth/confirmar/route.ts    # quando a pessoa clica no link do e-mail
│  │  └─ (app)/                     # tudo que exige login
│  │     ├─ layout.tsx              # menu inferior fixo, muda conforme o papel
│  │     ├─ inicio/                 # tela inicial de cada papel
│  │     ├─ perfil/
│  │     ├─ equipe/                 # coordenador: montadores e ajudantes
│  │     └─ admin/                  # grupos, parques, usuarios, ajudantes, hoteis
│  ├─ acoes/                        # server actions (toda escrita passa por aqui, com Zod)
│  ├─ componentes/                  # botões, campos, listas, menu
│  └─ lib/
│     ├─ supabase/                  # cliente do navegador, do servidor e admin (service_role)
│     ├─ validacao/                 # esquemas Zod (CPF, CNPJ, Pix, telefone...)
│     └─ regras/                    # regras de negócio puras, com testes Vitest
├─ supabase/
│  ├─ migrations/                   # SQL versionado (abaixo)
│  └─ seed.sql                      # dados de exemplo para o projeto de teste
├─ testes/rls/                      # prova que cada papel só vê o que pode
├─ public/                          # manifest do PWA e ícones
├─ docs/                            # especificação, plano, propostas
├─ .mcp.json                        # Context7
└─ .env.example                     # nomes das variáveis, sem valores
```

## 2. Decisões de segurança no banco

- **RLS em todas as tabelas.** Sem política = ninguém acessa pela API.
- **Funções de permissão num schema privado** (`privado`), fora da API pública, para ninguém
  chamá-las de fora.
- **Usuário desativado perde tudo na hora:** as funções de permissão só reconhecem usuário
  `ativo = true`, então todas as políticas falham para quem foi desativado. Além disso, a ação
  de desativar também bloqueia o login no Supabase Auth.
- **Mass assignment bloqueado por gatilho:** `criado_por`, `criado_em`, `papel`, `ativo`,
  `coordenador_id` e `situacao` não podem ser definidos pelo formulário de quem não é admin; o banco
  sobrescreve ou recusa.
- **Cadastro de usuário só pelo servidor** (convite com a chave service_role, depois de checar que
  quem pediu é admin). Cadastro aberto desligado no Supabase Auth.
- **CPF e Pix numa tabela separada.** Coordenador consegue cadastrar, mas só lê a versão mascarada,
  por uma função específica. Admin lê completo.
- **Auditoria automática** por gatilho em todas as tabelas: grava antes/depois, quem e quando.
  Ninguém edita nem apaga a auditoria.

## 3. Migrações SQL

### `20261102000001_base.sql`: tipos, funções de apoio e carimbo

```sql
create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;

create extension if not exists citext;

create type public.papel_usuario     as enum ('admin', 'coordenador', 'montador');
create type public.situacao_ajudante as enum ('pendente', 'ativo', 'inativo');
create type public.tipo_chave_pix    as enum ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria');

-- Carimbo: criado_em/criado_por não podem ser forjados; atualizado_em sempre atualizado
create or replace function privado.tg_carimbo() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.criado_em  := now();
    new.criado_por := coalesce(auth.uid(), new.criado_por); -- service_role (sem uid) informa quem pediu
  else
    new.criado_em  := old.criado_em;
    new.criado_por := old.criado_por;
  end if;
  new.atualizado_em := now();
  return new;
end $$;
```

### `20261102000002_usuarios.sql`

```sql
create table public.usuarios (
  id             uuid primary key references auth.users(id) on delete restrict,
  nome           text not null check (char_length(nome) between 2 and 120),
  email          citext not null unique,
  telefone       text check (telefone ~ '^[0-9]{10,11}$'),
  papel          public.papel_usuario not null,
  coordenador_id uuid references public.usuarios(id),
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  criado_por     uuid references auth.users(id),
  constraint montador_tem_coordenador check (papel <> 'montador' or coordenador_id is not null)
);
create index on public.usuarios (coordenador_id);

-- Funções de permissão (só reconhecem usuário ativo)
create or replace function privado.meu_papel() returns public.papel_usuario
language sql stable security definer set search_path = '' as $$
  select papel from public.usuarios where id = (select auth.uid()) and ativo
$$;
create or replace function privado.eh_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(privado.meu_papel() = 'admin', false)
$$;
create or replace function privado.eh_coordenador() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(privado.meu_papel() = 'coordenador', false)
$$;

-- Quem não é admin só pode mudar nome e telefone do próprio cadastro
create or replace function privado.tg_usuarios_protege() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not privado.eh_admin() and auth.uid() is not null then
    if new.papel is distinct from old.papel
       or new.ativo is distinct from old.ativo
       or new.coordenador_id is distinct from old.coordenador_id
       or new.email is distinct from old.email then
      raise exception 'Sem permissão para alterar este campo';
    end if;
  end if;
  return new;
end $$;

create trigger carimbo before insert or update on public.usuarios
  for each row execute function privado.tg_carimbo();
create trigger protege before update on public.usuarios
  for each row execute function privado.tg_usuarios_protege();

alter table public.usuarios enable row level security;

create policy "le o proprio" on public.usuarios for select to authenticated
  using (id = (select auth.uid()) and ativo);
create policy "coordenador le seus montadores" on public.usuarios for select to authenticated
  using ((select privado.eh_coordenador()) and coordenador_id = (select auth.uid()));
create policy "admin le todos" on public.usuarios for select to authenticated
  using ((select privado.eh_admin()));
create policy "edita o proprio" on public.usuarios for update to authenticated
  using (id = (select auth.uid()) and ativo) with check (id = (select auth.uid()));
create policy "admin edita" on public.usuarios for update to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
-- Sem política de INSERT/DELETE: convite e criação só pelo servidor (service_role).
```

### `20261102000003_cadastros.sql`: grupos, parques, hotéis

```sql
create table public.grupos (
  id            uuid primary key default gen_random_uuid(),
  codigo        text not null unique check (codigo ~ '^GP[0-9]+$'),
  razao_social  text not null check (char_length(razao_social) between 2 and 200),
  cnpj          text not null unique check (cnpj ~ '^[0-9]{14}$'),
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  criado_por    uuid references auth.users(id)
);

create table public.parques (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null unique check (char_length(nome) between 2 and 120),
  grupo_id       uuid not null references public.grupos(id),
  coordenador_id uuid references public.usuarios(id),
  shopping_atual text,
  cidade         text,
  uf             char(2) check (uf ~ '^[A-Z]{2}$'),
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  criado_por     uuid references auth.users(id)
);
create index on public.parques (grupo_id);
create index on public.parques (coordenador_id);

create table public.hoteis (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null check (char_length(nome) between 2 and 160),
  endereco      text,
  cidade        text,
  uf            char(2) check (uf ~ '^[A-Z]{2}$'),
  telefone      text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  criado_por    uuid references auth.users(id)
);

create trigger carimbo before insert or update on public.grupos
  for each row execute function privado.tg_carimbo();
create trigger carimbo before insert or update on public.parques
  for each row execute function privado.tg_carimbo();
create trigger carimbo before insert or update on public.hoteis
  for each row execute function privado.tg_carimbo();

alter table public.grupos  enable row level security;
alter table public.parques enable row level security;
alter table public.hoteis  enable row level security;

-- Grupos: admin tudo; coordenador lê
create policy "admin gerencia grupos" on public.grupos for all to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy "coordenador le grupos" on public.grupos for select to authenticated
  using ((select privado.eh_coordenador()));

-- Parques: admin tudo; coordenador lê só os dele
create policy "admin gerencia parques" on public.parques for all to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy "coordenador le seus parques" on public.parques for select to authenticated
  using ((select privado.eh_coordenador()) and coordenador_id = (select auth.uid()));

-- Hotéis: admin tudo; coordenador lê e cadastra
create policy "admin gerencia hoteis" on public.hoteis for all to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy "coordenador le hoteis" on public.hoteis for select to authenticated
  using ((select privado.eh_coordenador()));
create policy "coordenador cadastra hotel" on public.hoteis for insert to authenticated
  with check ((select privado.eh_coordenador()));
```

### `20261102000004_ajudantes.sql`: ajudantes e dados bancários

```sql
create table public.ajudantes (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null check (char_length(nome) between 2 and 120),
  telefone       text check (telefone ~ '^[0-9]{10,11}$'),
  coordenador_id uuid not null references public.usuarios(id),
  situacao       public.situacao_ajudante not null default 'pendente',
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  criado_por     uuid references auth.users(id)
);
create index on public.ajudantes (coordenador_id);

-- Coordenador: o ajudante sempre entra como pendente e vinculado a ele; não muda situação nem dono
create or replace function privado.tg_ajudantes_protege() returns trigger
language plpgsql set search_path = '' as $$
begin
  if privado.eh_coordenador() then
    if tg_op = 'INSERT' then
      new.situacao := 'pendente';
      new.coordenador_id := auth.uid();
    elsif new.situacao is distinct from old.situacao
       or new.coordenador_id is distinct from old.coordenador_id then
      raise exception 'Sem permissão para alterar este campo';
    end if;
  end if;
  return new;
end $$;

create table public.dados_bancarios (
  id             uuid primary key default gen_random_uuid(),
  ajudante_id    uuid unique references public.ajudantes(id) on delete cascade,
  -- favorecido_id entra na etapa (d), com a regra "exatamente um dos dois"
  cpf            text check (cpf ~ '^[0-9]{11}$'),
  tipo_chave_pix public.tipo_chave_pix not null,
  chave_pix      text not null check (char_length(chave_pix) between 3 and 140),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  criado_por     uuid references auth.users(id)
);

create trigger carimbo before insert or update on public.ajudantes
  for each row execute function privado.tg_carimbo();
create trigger protege before insert or update on public.ajudantes
  for each row execute function privado.tg_ajudantes_protege();
create trigger carimbo before insert or update on public.dados_bancarios
  for each row execute function privado.tg_carimbo();

alter table public.ajudantes       enable row level security;
alter table public.dados_bancarios enable row level security;

create policy "admin gerencia ajudantes" on public.ajudantes for all to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy "coordenador le seus ajudantes" on public.ajudantes for select to authenticated
  using ((select privado.eh_coordenador()) and coordenador_id = (select auth.uid()));
create policy "coordenador cadastra ajudante" on public.ajudantes for insert to authenticated
  with check ((select privado.eh_coordenador()));
create policy "coordenador edita seus ajudantes" on public.ajudantes for update to authenticated
  using ((select privado.eh_coordenador()) and coordenador_id = (select auth.uid()))
  with check (coordenador_id = (select auth.uid()));

-- Dados bancários: só admin lê direto. Coordenador só cadastra para os ajudantes dele.
create policy "admin gerencia dados bancarios" on public.dados_bancarios for all to authenticated
  using ((select privado.eh_admin())) with check ((select privado.eh_admin()));
create policy "coordenador cadastra dados dos seus" on public.dados_bancarios for insert to authenticated
  with check (
    (select privado.eh_coordenador())
    and exists (select 1 from public.ajudantes a
                where a.id = ajudante_id and a.coordenador_id = (select auth.uid()))
  );

-- Leitura mascarada para o coordenador (ex.: ***.456.789-** e chave Pix parcial)
create or replace function public.dados_bancarios_da_equipe()
returns table (ajudante_id uuid, cpf_mascarado text, tipo_chave_pix public.tipo_chave_pix, chave_pix_mascarada text)
language sql stable security definer set search_path = '' as $$
  select d.ajudante_id,
         case when d.cpf is null then null
              else '***.' || substr(d.cpf, 4, 3) || '.' || substr(d.cpf, 7, 3) || '-**' end,
         d.tipo_chave_pix,
         left(d.chave_pix, 3) || repeat('*', greatest(char_length(d.chave_pix) - 5, 3)) || right(d.chave_pix, 2)
  from public.dados_bancarios d
  join public.ajudantes a on a.id = d.ajudante_id
  where privado.eh_coordenador() and a.coordenador_id = (select auth.uid())
$$;
revoke all on function public.dados_bancarios_da_equipe() from public, anon;
grant execute on function public.dados_bancarios_da_equipe() to authenticated;
```

### `20261102000005_auditoria.sql`

```sql
create table public.auditoria (
  id          bigint generated always as identity primary key,
  tabela      text not null,
  registro_id text not null,
  acao        text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id  uuid,
  antes       jsonb,
  depois      jsonb,
  quando      timestamptz not null default now()
);
create index on public.auditoria (tabela, registro_id);
create index on public.auditoria (quando desc);

create or replace function privado.tg_auditoria() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.auditoria (tabela, registro_id, acao, usuario_id, antes, depois)
  values (
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end::text,
    tg_op,
    auth.uid(),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

create trigger auditoria after insert or update or delete on public.usuarios
  for each row execute function privado.tg_auditoria();
create trigger auditoria after insert or update or delete on public.grupos
  for each row execute function privado.tg_auditoria();
create trigger auditoria after insert or update or delete on public.parques
  for each row execute function privado.tg_auditoria();
create trigger auditoria after insert or update or delete on public.hoteis
  for each row execute function privado.tg_auditoria();
create trigger auditoria after insert or update or delete on public.ajudantes
  for each row execute function privado.tg_auditoria();
create trigger auditoria after insert or update or delete on public.dados_bancarios
  for each row execute function privado.tg_auditoria();

alter table public.auditoria enable row level security;
create policy "admin le auditoria" on public.auditoria for select to authenticated
  using ((select privado.eh_admin()));
-- Sem política de INSERT/UPDATE/DELETE: só o gatilho grava; ninguém altera nem apaga.
revoke insert, update, delete, truncate on public.auditoria from anon, authenticated;
```

## 4. Como vou provar que funciona
- **Testes de RLS** (`testes/rls/`): cria 1 admin, 2 coordenadores e 1 montador de teste no projeto
  de teste e verifica, chamando a API direto, que:
  - coordenador A não vê parques, montadores, ajudantes nem dados bancários do coordenador B;
  - coordenador não lê CPF/Pix completos, só mascarados;
  - coordenador não consegue mudar o próprio papel, ativar ajudante nem forjar `criado_por`;
  - montador não vê grupos, parques, hotéis, ajudantes nem dados bancários;
  - usuário desativado não vê mais nada;
  - ninguém além do admin lê a auditoria, e ninguém consegue apagá-la.
- **Security Advisors do Supabase** sem alertas.
- **Checklist dos 20 itens** de segurança preenchido.
