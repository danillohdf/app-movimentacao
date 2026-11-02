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

-- Observação: o Security Advisor avisa que esta função SECURITY DEFINER pode ser chamada por
-- usuários logados. É intencional: ela é o único caminho do coordenador para ler CPF/Pix, e só
-- devolve dados MASCARADOS dos ajudantes dele (filtro por auth.uid() dentro da função).
