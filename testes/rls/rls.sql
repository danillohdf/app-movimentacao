-- Testes de permissão (RLS). Rodar no projeto de TESTE depois do seed.sql.
-- Simula cada papel exatamente como a API do Supabase faz (role + JWT) e confere o que cada um
-- consegue ver e alterar. Toda escrita é desfeita: o banco fica como estava.
-- Resultado: uma linha por teste, com ok = true/false.

create temp table resultado (n serial, teste text, ok boolean, detalhe text);

create function pg_temp.como(uid uuid, papel text default 'authenticated') returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', papel)::text, true);
  perform set_config('role', papel, true);
end $$;

create function pg_temp.registrar(teste text, ok boolean, detalhe text) returns void
language sql as $$ insert into resultado (teste, ok, detalhe) values (teste, coalesce(ok, false), detalhe) $$;

do $$
declare
  admin  uuid := 'a0000000-0000-4000-8000-000000000001';
  coordA uuid := 'c0000000-0000-4000-8000-00000000000a';
  coordB uuid := 'c0000000-0000-4000-8000-00000000000b';
  mont   uuid := 'd0000000-0000-4000-8000-000000000001';
  ajB    uuid := 'e0000000-0000-4000-8000-000000000003';
  ajPend uuid := 'e0000000-0000-4000-8000-000000000002';
  n int; m int; t text; t2 text; ok_ boolean; det text;
begin
  -- 1
  perform pg_temp.como(coordA);
  select count(*), count(*) filter (where nome = 'Parque Exemplo 3') into n, m from public.parques;
  reset role;
  perform pg_temp.registrar('Coordenador vê só os próprios parques', n = 2 and m = 0, format('viu %s, do outro: %s', n, m));

  -- 2
  perform pg_temp.como(coordA);
  select count(*), count(*) filter (where coordenador_id = coordB) into n, m from public.ajudantes;
  reset role;
  perform pg_temp.registrar('Coordenador vê só os próprios ajudantes', n = 2 and m = 0, format('viu %s, do outro: %s', n, m));

  -- 3
  perform pg_temp.como(coordA);
  select count(*) into n from public.dados_bancarios;
  reset role;
  perform pg_temp.registrar('Coordenador não lê CPF/Pix completos', n = 0, format('linhas visíveis: %s', n));

  -- 4
  perform pg_temp.como(coordA);
  select count(*), max(cpf_mascarado), max(chave_pix_mascarada) into n, t, t2 from public.dados_bancarios_da_equipe();
  reset role;
  perform pg_temp.registrar('Coordenador vê Pix mascarado só dos seus',
    n = 1 and t like '***.%-**' and t2 like '%*%' and t2 not like '%52998224725%', format('%s linha(s): %s / %s', n, t, t2));

  -- 5
  perform pg_temp.como(coordA);
  select count(*), count(*) filter (where id in (admin, coordB)) into n, m from public.usuarios;
  reset role;
  perform pg_temp.registrar('Coordenador vê só ele e seus montadores', n = 2 and m = 0, format('viu %s, indevidos: %s', n, m));

  -- 6
  begin
    perform pg_temp.como(coordA);
    update public.usuarios set papel = 'admin' where id = coordA;
    reset role; ok_ := false; det := 'conseguiu mudar';
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := true; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Coordenador não muda o próprio papel', ok_, det);

  -- 7
  begin
    perform pg_temp.como(coordA);
    insert into public.ajudantes (nome, coordenador_id, situacao, criado_por) values ('Forjado', coordB, 'ativo', admin);
    reset role;
    select count(*) into n from public.ajudantes
      where nome = 'Forjado' and situacao = 'pendente' and coordenador_id = coordA and criado_por = coordA;
    ok_ := n = 1; det := format('campos corrigidos pelo banco: %s', n);
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := false; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Banco ignora campos forjados (situação, dono, criado_por)', ok_, det);

  -- 8
  begin
    perform pg_temp.como(coordA);
    update public.ajudantes set situacao = 'ativo' where id = ajPend;
    reset role; ok_ := false; det := 'conseguiu validar';
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := true; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Coordenador não valida ajudante', ok_, det);

  -- 9
  begin
    perform pg_temp.como(coordA);
    update public.ajudantes set nome = 'Alterado' where id = ajB;
    get diagnostics n = row_count;
    reset role; ok_ := n = 0; det := format('linhas alteradas: %s', n);
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := true; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Coordenador não altera ajudante de outro', ok_, det);

  -- 10
  begin
    perform pg_temp.como(coordA);
    insert into public.dados_bancarios (ajudante_id, tipo_chave_pix, chave_pix) values (ajB, 'email', 'golpe@exemplo.com');
    reset role; ok_ := false; det := 'conseguiu';
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := true; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Coordenador não troca Pix de ajudante de outro', ok_, det);

  -- 11
  begin
    perform pg_temp.como(coordA);
    insert into public.grupos (codigo, razao_social, cnpj) values ('GP99', 'X', '11222333000181');
    reset role; ok_ := false; det := 'conseguiu';
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := true; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Coordenador não cadastra GP', ok_, det);

  -- 12
  perform pg_temp.como(mont);
  select (select count(*) from public.grupos) + (select count(*) from public.parques) + (select count(*) from public.hoteis)
       + (select count(*) from public.ajudantes) + (select count(*) from public.dados_bancarios)
       + (select count(*) from public.dados_bancarios_da_equipe()) into n;
  select count(*) into m from public.usuarios;
  reset role;
  perform pg_temp.registrar('Montador não vê GPs, parques, hotéis, ajudantes nem Pix', n = 0 and m = 1, format('registros vistos: %s, usuários: %s', n, m));

  -- 13
  begin
    update public.usuarios set ativo = false where id = coordB;
    perform pg_temp.como(coordB);
    select (select count(*) from public.parques) + (select count(*) from public.ajudantes) + (select count(*) from public.usuarios) into n;
    reset role; ok_ := n = 0; det := format('registros vistos: %s', n);
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := false; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Usuário desativado não vê mais nada', ok_, det);

  -- 14
  perform pg_temp.como(coordA);
  select count(*) into n from public.auditoria;
  reset role;
  perform pg_temp.como(admin);
  select count(*) into m from public.auditoria;
  reset role;
  perform pg_temp.registrar('Só admin lê a auditoria', n = 0 and m > 0, format('coordenador: %s, admin: %s', n, m));

  -- 15
  begin
    perform pg_temp.como(admin);
    delete from public.auditoria;
    get diagnostics n = row_count;
    reset role; ok_ := n = 0; det := format('apagou %s', n);
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := true; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Ninguém apaga a auditoria (nem o admin)', ok_, det);

  -- 16
  perform pg_temp.como(null, 'anon');
  select (select count(*) from public.usuarios) + (select count(*) from public.parques) + (select count(*) from public.grupos)
       + (select count(*) from public.ajudantes) + (select count(*) from public.dados_bancarios) into n;
  reset role;
  perform pg_temp.registrar('Sem login não vê nada', n = 0, format('registros vistos: %s', n));

  -- 17
  perform pg_temp.como(admin);
  select count(*) into n from public.parques;
  select count(*) into m from public.dados_bancarios;
  reset role;
  perform pg_temp.registrar('Admin vê todos os parques e Pix', n = 3 and m = 2, format('parques: %s, Pix: %s', n, m));

  -- 18
  begin
    perform pg_temp.como(coordA);
    update public.usuarios set nome = 'Renan (teste editado)' where id = coordA;
    reset role;
    select count(*) into n from public.auditoria
      where tabela = 'usuarios' and registro_id = coordA::text and acao = 'UPDATE' and usuario_id = coordA;
    ok_ := n = 1; det := format('registros: %s', n);
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := false; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Alteração fica na auditoria com o autor', ok_, det);

  -- 19
  begin
    perform pg_temp.como(coordA);
    update public.usuarios set nome = 'Invasão' where id = coordB;
    get diagnostics n = row_count;
    reset role; ok_ := n = 0; det := format('linhas alteradas: %s', n);
    raise exception 'desfazer';
  exception when others then
    reset role;
    if sqlerrm <> 'desfazer' then ok_ := true; det := sqlerrm; end if;
  end;
  perform pg_temp.registrar('Coordenador não edita outro usuário', ok_, det);
end $$;

select n, ok, teste, detalhe from resultado order by n;
