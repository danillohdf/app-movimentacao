# Plano de construção

Base: [ESPECIFICACAO.md](../ESPECIFICACAO.md). Este plano precisa da aprovação do admin antes
de qualquer código.

## 1. Estrutura técnica

| Peça | Escolha |
|---|---|
| Telas | Next.js (App Router) + Tailwind, PWA instalável, hospedado na Vercel |
| Banco, login, arquivos | Supabase (Postgres + Auth + Storage), região São Paulo (sa-east-1) |
| Validação | Zod, sempre no servidor |
| Mudanças no banco | Migrações SQL versionadas em `supabase/migrations/` |
| Testes | Vitest para as regras de negócio; script de testes de permissão (RLS) rodando com usuários de teste |
| Documentação das bibliotecas | Context7 (configurado em `.mcp.json`) |

## 2. Estrutura de dados

Todas as tabelas com RLS ativado. Campos `criado_em`, `atualizado_em` e `criado_por` em todas.

### Etapa (a): cadastros e login
| Tabela | Colunas principais | Quem acessa |
|---|---|---|
| `grupos` (GPs) | codigo (GP1...), razao_social, cnpj, ativo | Admin escreve; coordenador lê |
| `parques` | nome, grupo_id, coordenador_id, shopping_atual, cidade, uf, ativo | Admin escreve; coordenador lê os dele |
| `usuarios` (ligada ao login) | nome, email, telefone, papel (admin/coordenador/montador), coordenador_id (do montador), ativo | Cada um lê o próprio; coordenador lê os montadores dele; só admin muda papel/ativo |
| `ajudantes` (não fazem login) | nome, telefone, coordenador_id, situacao (pendente/ativo/inativo) | Coordenador lê e cadastra os dele (entra como pendente); admin valida |
| `dados_bancarios` (separada por ser sensível) | pessoa (ajudante ou favorecido), cpf, tipo_chave_pix, chave_pix | Admin lê completo; coordenador lê mascarado dos dele |
| `hoteis` | nome, endereco, cidade, uf, telefone | Admin e coordenador |
| `auditoria` | tabela, registro_id, acao, usuario_id, antes, depois, quando | Só admin lê; ninguém edita nem apaga |

### Etapas seguintes (desenho preliminar, detalhado antes de cada etapa)
- (b) `roteiros`, `roteiro_equipe`, `roteiro_anexos`
- (c) `reembolsos` (com lote por dia/parque), `reembolso_anexos`
- (d) `favorecidos`, `pagamentos`, `pagamento_anexos`, `historico_status`.
  `pagamentos` já nasce com `referencia_externa` e `origem_status` (manual / EK-BPO) para a
  futura integração que vai marcar como pago automaticamente.

## 3. Login e acesso
- Só por convite: o admin cadastra a pessoa (nome, e-mail, papel), e ela recebe um e-mail.
  Ninguém consegue criar conta sozinho.
- Para entrar: digita o e-mail → recebe um código de 6 dígitos (e um link) → entra.
  O código funciona melhor que só o link no app instalado no celular.
- Sessão em cookie seguro (httpOnly, Secure, SameSite). Usuário desativado perde o acesso na hora.
- Limite de tentativas e captcha (Turnstile) na tela de login.
- **E-mail em produção:** o envio padrão do Supabase só manda e-mail para os membros da sua
  conta Supabase, com limite baixo por hora. Para mandar para coordenadores e montadores é preciso
  um serviço de envio (ex.: Resend, grátis até 3.000 e-mails/mês) com um domínio da empresa.
  Para testar, dá para usar o envio padrão com o seu e-mail.

## 4. Telas da etapa (a)

**Todos:** Entrar (e-mail → código) · Meu perfil · Sair

**Admin**
- Início: atalhos e contadores (pendências aparecem nas etapas seguintes)
- Cadastros: GPs · Parques · Usuários (convidar, mudar papel, desativar, reenviar convite) ·
  Ajudantes (validar pendentes) · Hotéis

**Coordenador**
- Início: resumo da equipe
- Minha equipe: montadores dele (consulta) e ajudantes (cadastro rápido, fica pendente de validação)

**Montador**
- Início: "Seus roteiros aparecerão aqui" (preenchido na etapa b)

Menu inferior fixo com botões grandes, pensado para uso com uma mão.

## 5. Ordem de construção
1. **(a) Cadastros + login/perfis** ← próxima
2. (b) Roteiros + importação da AGENDA KIDS OFICIAL
3. (c) Reembolsos de ajudante
4. (d) Pagamentos
5. (e) Painel admin e exportações (EK-BPO)

Cada etapa termina com: link de teste na Vercel, roteiro de teste por perfil, testes automatizados
e checklist de segurança (20 itens).

## 6. Pendências para começar
- [ ] Acesso de escrita do Claude ao repositório no GitHub
- [ ] Projeto Supabase de teste (a conta grátis já está no limite de 2 projetos ativos)
- [ ] Lista de parques com GP (pode começar com dados de exemplo)
- [ ] Domínio da empresa para os e-mails (só necessário antes de produção)
