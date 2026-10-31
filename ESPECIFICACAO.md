# Projeto: App de Movimentação dos Parques (Coordenadores e Montadores)

## Contexto do negócio
Opero parques infantis itinerantes montados dentro de shoppings (chamamos internamente de "eventos").
Cada parque fica em média ~2 meses por shopping. A passagem completa (montagem → operação →
desmontagem) é uma "temporada". Os parques são divididos por sócio/grupo (GP1, GP2, GP4, GP5, GP6,
GP8), cada um com CNPJ/razão social própria. Todo pagamento precisa estar vinculado ao GP do parque,
porque o sistema financeiro (EK-BPO) faz pagamento rateado por empresa.

A agenda de movimentação vem da planilha "AGENDA KIDS OFICIAL", organizada por coordenador de
operação (Renan, Patrick, Lucas, Jean, Alefe), com um bloco por parque listando montagens e
desmontagens em sequência.

Hoje está tudo espalhado: roteiros em planilha/painel, pagamentos em planilhas de cada coordenador,
reembolsos de ajudante chegando por mensagem todo dia. Quero centralizar TUDO num app só, de uso
diário, pensado para celular.

Volume aproximado (para dimensionar):
- Coordenadores: 5 | Montadores: [PREENCHER] | Ajudantes ativos: [PREENCHER]
- Parques ativos ao mesmo tempo: [PREENCHER]
- Movimentações por mês: [PREENCHER]
- Reembolsos por dia: [PREENCHER] | Pagamentos por mês: [PREENCHER]

## Decisões já tomadas (31/10/2026)
- Login por e-mail (todo usuário tem e-mail vinculado, que também serve para notificações).
  O e-mail traz um código de 6 dígitos e um link; o código é o caminho principal porque funciona
  melhor no app instalado no celular. Acesso só por convite do admin (ninguém se cadastra sozinho).
- Montador só consulta os roteiros nesta primeira versão (check-in pode vir depois).
- Não há perfil financeiro separado: o admin marca como pago. No futuro, o status "Pago" deve vir
  de uma integração com o sistema de pagamentos atual (EK-BPO); o banco já guarda um campo de
  referência externa para isso.
- Vencimentos podem cair em sábado, domingo e feriado: não há cálculo de dia útil nem lista de feriados.

## Objetivo
Um app geral de movimentação com 3 módulos:
1. Roteiros: montadores e coordenadores consultam para onde vão, quando e com qual estrutura.
2. Pagamentos: coordenadores sobem as solicitações de pagamento da movimentação.
3. Reembolsos de ajudante: coordenadores sobem diariamente os reembolsos dos ajudantes.
Mais um painel administrativo para mim (e meu chefe) acompanhar, aprovar e exportar.

## Perfis e permissões
- Admin (eu e meu chefe): vê tudo, cadastra, aprova/reprova, edita, exporta.
- Coordenador: vê os roteiros dos parques dele, lança pagamentos e reembolsos da equipe dele,
  acompanha o status do que lançou. NÃO vê nada de outro coordenador.
- Montador: só consulta os roteiros em que está escalado (somente leitura).
- Sem perfil financeiro separado (ver "Decisões já tomadas").

As permissões precisam ser garantidas no servidor/banco, não só escondidas na tela
(detalhes na seção Segurança).

Login: por e-mail com código de 6 dígitos (ver "Decisões já tomadas"). Ajudantes não fazem login.
O admin cadastra o usuário, consegue resetar o acesso e desativar o usuário.

## Módulo 1: Roteiros
Cada roteiro é uma movimentação (montagem ou desmontagem) de um parque:
- Parque/evento e GP (automático pelo cadastro do parque)
- Tipo: montagem ou desmontagem
- Shopping de origem → shopping de destino, cidade, UF, endereço
- Data/hora de início e de fim
- Coordenador responsável e equipe escalada (montadores, ajudantes)
- Hotel (nome, endereço, check-in/check-out), quando houver
- Observações e anexos (planta, contato do shopping, regras de doca etc.)
- Status do roteiro: planejado / confirmado / em andamento / concluído / reprogramado / cancelado
[PREENCHER: campos que faltam ou sobram, como caminhão/placa, motorista ou estrutura levada]

Requisitos:
- O montador abre o app e vê primeiro o PRÓXIMO roteiro dele, depois a lista dos seguintes.
- Botão para abrir o endereço no Google Maps/Waze e botão para ligar no contato do shopping.
- Os dados do próximo roteiro ficam disponíveis mesmo sem sinal (última versão carregada).
- Importar os roteiros da AGENDA KIDS OFICIAL / base do "Painel de Roteiros", para eu não digitar
  tudo de novo. Segue em anexo um trecho real da planilha. [ANEXAR: export/print de 1 ou 2 blocos]
  [PREENCHER: importação única, ou a agenda continua sendo a fonte e o app sincroniza?]
- Quando um roteiro muda de data, os pagamentos vinculados que ainda não foram pagos devem ser
  sinalizados para revisão de vencimento (não alterar sozinho).

## Módulo 2: Pagamentos da movimentação
O coordenador lança a solicitação e eu acompanho até o pagamento.
Tipos: parcela de desmontagem, hotel de montagem, [PREENCHER: outros tipos, como combustível,
frete, diária de montador, pedágio...].

Campos: tipo, parque (GP automático), roteiro vinculado, valor, favorecido (do cadastro ou novo),
CPF/CNPJ do favorecido, forma de pagamento (Pix/boleto/transferência) com os dados de pagamento,
vencimento, anexos (boleto, NF, orçamento; foto ou PDF tirado direto do celular), observação.

Regras de negócio (IMPORTANTES, não altere sem me perguntar):
- A parcela de desmontagem vence no dia anterior ao início da desmontagem (dia corrido:
  pode cair em sábado, domingo ou feriado, porque a empresa paga em qualquer dia).
- O hotel de montagem é pago 1 dia antes do início da montagem (dia corrido, pode cair em fim de semana).
- O hotel de DESMONTAGEM não é lançado separado: ele já vem embutido na parcela de desmontagem.
  O app deve BLOQUEAR o lançamento de hotel de desmontagem avulso e explicar o motivo na tela.
- O vencimento é sugerido automaticamente a partir da data do roteiro vinculado, mas é editável
  (registrar quem alterou e por quê).
- A empresa paga também sábado e domingo, então reprogramações podem cair em fim de semana.

Status: Enviado → Aprovado / Reprovado (com motivo obrigatório) → Lançado no financeiro → Pago
(com upload do comprovante). O coordenador vê o status em tempo real.
- Reprovado: o coordenador pode corrigir e reenviar (mantendo o histórico).
- Depois de aprovado, só o admin edita.
- Cancelamento permitido até "Lançado no financeiro", com motivo.

Exportação: lista de pagamentos aprovados agrupada por GP/empresa e por vencimento, no formato que
facilite lançar no EK-BPO (pagamento rateado: vários parques da mesma empresa num lançamento só).
[ANEXAR: exemplo do formato que o EK-BPO aceita ou uma planilha de lançamento atual]

## Módulo 3: Reembolsos de ajudante (diário)
- Lançamento rápido pelo celular: data, parque/roteiro, ajudante (do cadastro, com Pix), tipo de
  despesa [PREENCHER: alimentação, transporte, diária...? Algum tem valor fixo ou teto?],
  valor, foto do recibo [PREENCHER: recibo obrigatório para todos os tipos?].
- Lançar vários ajudantes de uma vez para o mesmo dia/parque (lista com valor por ajudante).
- Se o ajudante não estiver cadastrado, o coordenador faz um cadastro rápido (nome, telefone, Pix)
  que fica pendente de validação do admin.
- Mesmo fluxo de status do módulo de pagamentos.
- Visão consolidada para mim: total por dia, por coordenador, por ajudante, por parque e por GP,
  e uma lista "a pagar hoje" com chave Pix e valor (botão para copiar o Pix), pronta para pagar.
- Alerta de possível duplicidade (mesmo ajudante, mesma data, mesmo valor): avisa, mas permite
  lançar com justificativa.
- [PREENCHER: os reembolsos são pagos um a um ou agrupados por ajudante no dia/semana?]

## Cadastros (Admin)
- Parques/eventos com o GP de cada um, e GPs com razão social/CNPJ. [ANEXAR: lista]
- Coordenadores, montadores e ajudantes (nome, telefone, CPF, chave Pix, coordenador a que pertence,
  ativo/inativo).
- Hotéis já usados (para reaproveitar).
- Favorecidos recorrentes (fornecedores de frete, hotéis etc.).

## Painel Admin
- Pendências de aprovação (pagamentos e reembolsos) com aprovar/reprovar rápido, inclusive em lote.
- Calendário/lista de vencimentos dos próximos dias.
- Totais por coordenador, parque, GP, tipo e período.
- Exportação para Excel/Google Planilhas.
- Histórico de quem lançou, aprovou ou alterou cada item (log de auditoria).

## Requisitos gerais
- Interface em português, simples, botões grandes, mobile-first, para quem usa só o celular na rua.
- Instalável na tela inicial do celular (PWA).
- Fotos comprimidas no celular antes do upload; upload resistente a sinal ruim (avisar se falhar,
  não perder o lançamento).
- Backup/exportação completa dos dados disponível para o admin.
- Ambiente de teste separado do de produção, com dados de exemplo.

## Segurança (requisito obrigatório, não opcional)
O app guarda CPF, chave Pix, valores e comprovantes. Segurança faz parte do "pronto" de cada
etapa, não é algo para o final.

Chaves e segredos
1. Nenhuma chave secreta no front nem no código. O front usa só a chave pública (anon/publishable)
   do Supabase; a chave service_role fica apenas no servidor (variáveis de ambiente da Vercel).
2. Arquivo .env no .gitignore desde o primeiro commit, mais um .env.example sem valores.
   Antes de cada push, verificar se nenhum segredo foi commitado (ex.: gitleaks). Se algum vazar,
   me avise e troque a chave, não basta apagar do histórico.
3. Variáveis separadas para teste e produção.

Acesso e permissões
4. RLS (Row Level Security) ativado em TODAS as tabelas, sem exceção, com políticas por perfil:
   coordenador só lê e escreve o que é dele; montador só lê os roteiros em que está escalado;
   admin vê tudo. Para cada etapa, escreva testes que provem que um coordenador NÃO consegue
   ler nem alterar dados de outro, nem chamando a API direto.
5. Autenticação e checagem de perfil sempre no servidor (middleware/server actions + RLS),
   nunca só escondendo botão na tela.
6. Bloquear mass assignment: o usuário nunca define campos como perfil, status, aprovado_por,
   coordenador_id ou valor aprovado pelo formulário. Esses campos são definidos pelo servidor/banco.
   Mudança de status só pelas transições permitidas e só por quem pode.
7. Princípio do menor acesso: cada perfil só recebe os campos de que precisa
   (ex.: montador não vê CPF, Pix nem valores).

Login e sessão
8. Usar o Supabase Auth. Não criar tabela própria de senhas/PIN. Se o login for por PIN,
   implementar em cima do Supabase Auth, com hash feito por ele.
9. Cookies de sessão httpOnly, Secure e SameSite; sessão expira; admin pode desativar usuário
   e o acesso cai na hora.
10. Limite de tentativas de login e captcha (Turnstile/hCaptcha, que o Supabase Auth suporta)
    para evitar força bruta e bots.

Dados
11. Validar todos os dados de entrada no servidor (ex.: Zod): tipos, tamanhos, valores positivos,
    datas válidas, CPF/CNPJ e chave Pix com formato válido.
12. Consultas sempre pelo cliente do Supabase ou com SQL parametrizado. Nunca montar SQL
    concatenando texto digitado pelo usuário.
13. Respostas da API só com os campos necessários (nada de select *). Mensagens de erro
    genéricas para o usuário, sem stack trace nem detalhes do banco.
14. CPF e chave Pix: criptografia em repouso (padrão do Supabase) e exibição mascarada na tela
    (ex.: ***.456.789-**), com o dado completo só para o admin na hora de pagar.
    Log de auditoria de quem viu ou alterou dados sensíveis (LGPD).

Uploads
15. Buckets privados no Supabase Storage, acessados por URL assinada com validade curta.
    Políticas de storage por perfil (coordenador só vê os anexos dele).
16. Aceitar só JPG, PNG, HEIC e PDF, com tamanho máximo 10 MB, validando o tipo
    real do arquivo e não só a extensão. Renomear arquivos no upload (sem usar o nome original).

Infraestrutura
17. HTTPS obrigatório (padrão da Vercel) e headers de segurança configurados: CSP, HSTS,
    X-Frame-Options, X-Content-Type-Options e Referrer-Policy.
18. Rate limit nas rotas sensíveis (login, uploads, exportações), usando o Firewall da Vercel
    ou equivalente.
19. Dependências: só pacotes conhecidos e mantidos; rodar npm audit; ativar Dependabot
    no GitHub; não instalar pacote com nome parecido com outro popular sem me avisar.
20. Backups do banco ativos e testados (saber restaurar).

Verificação
- Ao final de cada etapa, rode os Security Advisors do Supabase e corrija o que aparecer.
- Me entregue um checklist com esses 20 itens marcando: feito / não se aplica / pendente
  (e por quê).
- Antes de colocar em produção, faça uma revisão de segurança completa do código
  e me mostre o resultado.

## Stack (já decidida)
- Front: Next.js como PWA (instalável na tela inicial do celular), hospedado na Vercel,
  com deploy automático a partir do GitHub (repositório privado).
- Banco, login e arquivos: Supabase (Postgres + Auth + Storage).
- As permissões por perfil (admin, coordenador, montador) garantidas com Row Level Security
  no Supabase.
- Fotos e PDFs no Supabase Storage, em buckets privados, com acesso conforme o perfil.
- Exportações em Excel/CSV geradas pelo app, para eu levar ao Google Planilhas e ao EK-BPO.
- Dois ambientes: teste e produção (projetos Supabase separados, movimentacao-teste e
  movimentacao-prod, e preview da Vercel).
- Já tenho conta no GitHub, na Vercel e no Supabase.
- Eu não sou programador: me explique cada configuração (Vercel, Supabase, variáveis de
  ambiente, domínio) passo a passo, e mantenha o código simples de manter.
- Se algo da minha especificação não funcionar bem nesta stack, me avise antes de contornar.

## Documentação atualizada (Context7)
- Use o MCP do Context7 para consultar a documentação ATUAL das bibliotecas antes de escrever
  código que dependa delas, principalmente: Next.js (App Router, middleware, server actions),
  Supabase (supabase-js, @supabase/ssr, Auth, RLS, Storage), Vercel (config, headers, firewall),
  Zod, a biblioteca de PWA e a de exportação Excel que você escolher.
- Não confie em memória para APIs que mudam com frequência (ex.: autenticação do Supabase com
  Next.js); confira no Context7 e siga a versão instalada no package.json.
- Ao escolher uma biblioteca nova, confira no Context7 se ela é mantida e qual o jeito
  recomendado de uso, e me diga qual escolheu e por quê.
- Se o Context7 não estiver disponível na sessão, me avise antes de começar, em vez de seguir
  sem ele.

## Como quero que você trabalhe
1. Leia este documento inteiro e me faça as perguntas que faltarem, principalmente as marcadas
   [PREENCHER]. Não invente regra de negócio; se precisar assumir algo, liste a suposição.
   A stack já está decidida, não precisa comparar alternativas.
2. Me entregue um plano: estrutura de dados (tabelas e colunas), telas por perfil, fluxo de status,
   políticas de permissão (RLS) e ordem de construção. Espere minha aprovação.
3. Construa por etapas, uma de cada vez, e espere eu testar antes de seguir:
   (a) cadastros + login/perfis → (b) roteiros (incluindo importação da agenda) →
   (c) reembolsos de ajudante → (d) pagamentos → (e) painel admin e exportações.
4. Ao final de cada etapa, me entregue:
   - o que foi feito e o que ficou de fora;
   - como publicar/atualizar (passo a passo para não-programador);
   - um roteiro de teste com cada perfil (admin, coordenador, montador), com usuários de teste;
   - testes automatizados das regras de vencimento e de bloqueio do hotel de desmontagem;
   - o checklist de segurança da etapa (20 itens) com o status de cada um.
