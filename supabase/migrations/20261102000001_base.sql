create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;

create extension if not exists citext with schema extensions;

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
