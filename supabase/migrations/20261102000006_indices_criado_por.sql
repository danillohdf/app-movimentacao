-- Índices nas chaves estrangeiras criado_por (recomendação do Supabase Performance Advisor)
create index on public.usuarios (criado_por);
create index on public.grupos (criado_por);
create index on public.parques (criado_por);
create index on public.hoteis (criado_por);
create index on public.ajudantes (criado_por);
create index on public.dados_bancarios (criado_por);
