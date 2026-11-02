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
