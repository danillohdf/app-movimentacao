-- DADOS DE EXEMPLO: rodar SÓ no projeto de TESTE (movimentacao-teste). Nunca em produção.
-- Cria o admin, 2 coordenadores, 1 montador, GPs, parques, hotel e ajudantes fictícios.
-- Os e-mails "+alias" do Gmail chegam na mesma caixa do admin, para testar cada papel.

create or replace function pg_temp.criar_login(p_id uuid, p_email text) returns void
language sql as $$
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated', p_email, '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(),
    '', '', '', '', '', '', '', ''
  ) on conflict (id) do nothing;
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), p_id, p_id::text,
          jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
          'email', now(), now(), now())
  on conflict do nothing;
$$;

select pg_temp.criar_login('a0000000-0000-4000-8000-000000000001', 'danilohf123@gmail.com');
select pg_temp.criar_login('c0000000-0000-4000-8000-00000000000a', 'danilohf123+renan@gmail.com');
select pg_temp.criar_login('c0000000-0000-4000-8000-00000000000b', 'danilohf123+patrick@gmail.com');
select pg_temp.criar_login('d0000000-0000-4000-8000-000000000001', 'danilohf123+montador@gmail.com');

insert into public.usuarios (id, nome, email, papel, coordenador_id, criado_por) values
  ('a0000000-0000-4000-8000-000000000001', 'Danilo', 'danilohf123@gmail.com', 'admin', null, 'a0000000-0000-4000-8000-000000000001'),
  ('c0000000-0000-4000-8000-00000000000a', 'Renan (teste)', 'danilohf123+renan@gmail.com', 'coordenador', null, 'a0000000-0000-4000-8000-000000000001'),
  ('c0000000-0000-4000-8000-00000000000b', 'Patrick (teste)', 'danilohf123+patrick@gmail.com', 'coordenador', null, 'a0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000001', 'Montador (teste)', 'danilohf123+montador@gmail.com', 'montador', 'c0000000-0000-4000-8000-00000000000a', 'a0000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

insert into public.grupos (codigo, razao_social, cnpj) values
  ('GP1', 'Empresa GP1 (exemplo) Ltda', '11111111000191'),
  ('GP2', 'Empresa GP2 (exemplo) Ltda', '22222222000191'),
  ('GP4', 'Empresa GP4 (exemplo) Ltda', '44444444000191'),
  ('GP5', 'Empresa GP5 (exemplo) Ltda', '55555555000191'),
  ('GP6', 'Empresa GP6 (exemplo) Ltda', '66666666000191'),
  ('GP8', 'Empresa GP8 (exemplo) Ltda', '88888888000191')
on conflict (codigo) do nothing;

insert into public.parques (nome, grupo_id, coordenador_id, shopping_atual, cidade, uf)
select v.nome, g.id, v.coord::uuid, v.shopping, v.cidade, v.uf
from (values
  ('Parque Exemplo 1', 'GP1', 'c0000000-0000-4000-8000-00000000000a', 'Shopping Exemplo Norte', 'São Paulo', 'SP'),
  ('Parque Exemplo 2', 'GP2', 'c0000000-0000-4000-8000-00000000000a', 'Shopping Exemplo Sul', 'Campinas', 'SP'),
  ('Parque Exemplo 3', 'GP4', 'c0000000-0000-4000-8000-00000000000b', 'Shopping Exemplo Centro', 'Belo Horizonte', 'MG')
) as v(nome, gp, coord, shopping, cidade, uf)
join public.grupos g on g.codigo = v.gp
on conflict (nome) do nothing;

insert into public.hoteis (nome, cidade, uf) values ('Hotel Exemplo', 'Campinas', 'SP');

insert into public.ajudantes (id, nome, telefone, coordenador_id, situacao) values
  ('e0000000-0000-4000-8000-000000000001', 'Ajudante Um (teste)', '11987654321', 'c0000000-0000-4000-8000-00000000000a', 'ativo'),
  ('e0000000-0000-4000-8000-000000000002', 'Ajudante Dois (teste)', null, 'c0000000-0000-4000-8000-00000000000a', 'pendente'),
  ('e0000000-0000-4000-8000-000000000003', 'Ajudante Três (teste)', null, 'c0000000-0000-4000-8000-00000000000b', 'ativo')
on conflict (id) do nothing;

insert into public.dados_bancarios (ajudante_id, cpf, tipo_chave_pix, chave_pix) values
  ('e0000000-0000-4000-8000-000000000001', '52998224725', 'cpf', '52998224725'),
  ('e0000000-0000-4000-8000-000000000003', null, 'email', 'ajudante.tres@exemplo.com')
on conflict (ajudante_id) do nothing;
