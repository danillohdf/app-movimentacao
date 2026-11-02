create table public.usuarios (
  id             uuid primary key references auth.users(id) on delete restrict,
  nome           text not null check (char_length(nome) between 2 and 120),
  email          extensions.citext not null unique,
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
