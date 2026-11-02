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
