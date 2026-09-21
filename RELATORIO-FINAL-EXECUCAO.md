# Relatório Final de Execução — Migração La Zecca Numismática → Next.js 14

**Data:** 2026-09-20
**Repositório:** `Derek-PCoelho/Lazecca`
**Branch de trabalho:** `genspark_ai_developer`
**Pull Request:** https://github.com/Derek-PCoelho/Lazecca/pull/1

---

## 1. Resumo Executivo

O protótipo estático (11 páginas HTML + React via CDN/Babel in-browser) da
La Zecca Numismática foi migrado integralmente para uma aplicação
**Next.js 14 (App Router)** com **exportação estática** (`output: 'export'`),
seguindo à risca a "regra de ouro" do megaprompt (código-fonte sempre
prevalece sobre documentação) e a hierarquia de dados definida
(`cadastro-v2.xlsx` > código > `README.md`).

Todas as 11 páginas do protótipo foram recriadas como rotas Next.js, mais 2
páginas placeholder novas (Política de Privacidade e Termos de Uso) para
eliminar links mortos do rodapé. O build de produção (`npm run build`) foi
executado com sucesso, gerando **160 páginas estáticas**. Nenhuma das 1800
créditos de orçamento foi excedida (uso real ficou dentro do previsto para
as Fases 0–3; a Fase 4/polimento e este relatório consomem a reserva final).

---

## 2. Status por Fase

| Fase | Escopo | Status |
|---|---|---|
| **Fase 0** — Descoberta, leitura de fontes, decisão de arquitetura, correção de dados | Leitura integral de README + 11 HTMLs + styles.css + data.js + blog-contents.js + components.jsx; análise de `cadastro-v2.xlsx` via `openpyxl`; pesquisa Hostinger; correções de dados com log de auditoria | ✅ **Concluída** |
| **Fase 1** — Fundação do app Next.js (scaffold, config, dados, libs, componentes base) | `web/` criado, `next.config.mjs`, `globals.css`, pipeline de dados JSON, `lib/config.js`, `lib/data.js`, `lib/cart.js`, `lib/useReveal.js`, `Icon`/`Header`/`Footer`/`ProductCard`/`FeatureStrip`/`OrnamentDivider` | ✅ **Concluída** |
| **Fase 2** — Páginas centrais (Home, Catálogo, Produto, Carrinho, Checkout) | 5 rotas, com Melhorias 1, 2, 4, 5, 6, 8, 13, 15 aplicadas | ✅ **Concluída** |
| **Fase 3** — Páginas institucionais e de conteúdo (Sobre, Autenticidade, Diário/Blog, Contato, Conta) | 6 rotas (incluindo dinâmica `/diario/[slug]`), Melhorias 9, 11 (mantida fora de escopo), 12, 14 | ✅ **Concluída** |
| **Fase 4** — Polimento (acessibilidade, meta tags, placeholders, build/validação) | Melhorias 16, 17, 18 + 3 itens extras + placeholders + `npm run build` + smoke test | ✅ **Concluída** |
| **Reserva final (50 créditos)** | Relatório Final de Execução (este documento) | ✅ **Concluída** |

---

## 3. Status por Melhoria Aprovada

| # | Melhoria | Status | Onde |
|---|---|---|---|
| 1 | Galeria real de imagens (remover efeito CSS simulado de foto) | ✅ Implementada | `app/produto/[slug]/ProductClient.js` — usa `product.images[]` real, sem rotação/sépia CSS simulados |
| 2 | Checkout funcional com navegação real por etapas | ✅ Implementada (client-side, ver Fase 0) | `app/checkout/page.js` — máquina de estados `identificacao → pagamento → confirmacao` |
| 4 | Filtro de preço dinâmico | ✅ Implementada | `lib/data.js:getPriceRange()` + `app/catalogo/CatalogClient.js` |
| 5 | Remover auto-populate de demonstração do carrinho | ✅ Implementada (removida) | `app/carrinho/page.js` — comentário explícito confirma ausência do `useEffect` de auto-populate |
| 6 | Frete funcional por transportadora | ✅ Implementada (client-side, ver Fase 0) | `lib/config.js:SHIPPING_METHODS/getShippingPrice` + `app/checkout/page.js` |
| 7 | Padronizar IDs legados para formato Cxxxx a partir de C0136 | ✅ Implementada | `web/data/products.json` — 4 itens sample renumerados `C0136`–`C0139`, `legacyId` preservado |
| 8 | Produto inexistente → redireciona ao catálogo com mensagem | ✅ Implementada | `app/produto/[slug]/page.js` (`notFound()`) + `app/not-found.js` (CTA para `/catalogo`) |
| 9 | Remover CSS morto `.team-grid`/`.team-card` | ✅ Implementada (removido) | Removido de `app/globals.css` via brace-matching programático |
| 13 | Controle real de estoque (prioridade máxima) | ✅ Implementada | `lib/cart.js` (bloqueio em `addToCart`/`updateQty`) + `components/ProductCard.js` + `ProductClient.js` |
| 14 | Rotas amigáveis dinâmicas | ✅ Implementada | `/produto/[slug]`, `/diario/[slug]` com `generateStaticParams` |
| 15 | Meta tags dinâmicas | ✅ Implementada | `generateMetadata()` em `produto/[slug]/page.js` e `diario/[slug]/page.js` |
| 16 | Acessibilidade (ícones) | ✅ Implementada | `components/Icon.js` — `aria-hidden`/`role="img"`+`aria-label` |
| 17 | Alt text em imagens | ✅ Implementada | Todas as `<img>`/`<Image>` recebem `alt` significativo (nome do produto/artigo) |
| 18 | Configuração de contato centralizada | ✅ Implementada | `lib/config.js:CONTACT` — consumido por `Header`, `Footer`, `/contato` |
| Extra | Ano de copyright dinâmico | ✅ Implementada | `components/Footer.js` — `new Date().getFullYear()` |
| Extra | Placeholders Privacidade/Termos | ✅ Implementada | `app/politica-de-privacidade/page.js`, `app/termos-de-uso/page.js` |
| Extra | Links de categoria do rodapé reconciliados | ✅ Implementada | `lib/data.js:getFooterCategoryLinks()` |

### Explicitamente fora de escopo (Fase Futura)

| # | Melhoria | Status | Justificativa |
|---|---|---|---|
| 3 | Autenticação real | ⛔ Fora de escopo (conforme megaprompt) | `app/conta/page.js` preserva literalmente o mock do protótipo (`localStorage['lz_logged']`, usuário/pedidos hardcoded). Comentário no código reserva campo `passwordHash` para fase futura. |
| 11 | Submissão real do formulário de contato | ⛔ Fora de escopo (conforme megaprompt) | `app/contato/page.js` mantém o `onSubmit` de estado local existente, sem chamada de API/e-mail real. |

---

## 4. Arquitetura e Decisão de Hospedagem (Fase 0)

- **Pesquisa:** hospedagem compartilhada da Hostinger não executa Node.js/SSR;
  apenas planos Business, Cloud ou VPS suportam. Não foi possível confirmar
  o plano exato do cliente dentro do orçamento de Fase 0.
- **Decisão (fallback explícito do megaprompt):** adotado `output: 'export'`
  em `web/next.config.mjs` — gera HTML/CSS/JS 100% estático, compatível com
  qualquer plano de hospedagem, incluindo o compartilhado mais básico.
- **Consequência assumida e documentada no código:** Checkout (Melhoria 2) e
  cálculo de frete (Melhoria 6) são implementados como lógica **client-side**
  (estado React + funções puras em `lib/config.js`), e não como API routes
  server-side, já que o export estático não permite rotas de API.
- **Recomendação para fase futura:** se o cliente confirmar um plano com
  suporte a Node.js (Business/Cloud/VPS), a arquitetura pode evoluir para
  `output` padrão (SSR/ISR) com API routes reais para checkout e frete,
  sem necessidade de reescrever a UI.

---

## 5. Qualidade de Dados (Fase 0) — Resumo

Ver anexo completo em `data-quality-log.md` / `data-quality-log.json`.

- **135 cédulas reais** confirmadas na aba "Cédulas" de `cadastro-v2.xlsx`
  (IDs `C0001`–`C0135`, sem gaps).
- **Aba "Moedas" vazia** (0 linhas) — os 4 itens de moeda/acessório do
  protótipo (20.000 Réis Ouro, Morgan Dollar 1885-O, Denário Romano, Álbum
  Numismático) **não têm cadastro real**. Foram marcados `isSample: true`,
  renumerados para `C0136`–`C0139` (Melhoria 7), e ficam **ocultos do
  catálogo de produção por padrão** (visíveis apenas com
  `NEXT_PUBLIC_SHOW_SAMPLE_PRODUCTS=true`).
- **4 correções automáticas** aplicadas durante a importação (sem bloquear
  em confirmação manual, conforme instrução do megaprompt):
  1. C0056 — Ano `1658` → `1958` (incompatível com padrão Cruzeiro).
  2. C0020 — Denominação `"1 ESTAMPA"` → `"1 CRUZEIRO"` (valor trocado de coluna).
  3. C0006 — Assinaturas `"1 ESTAMPA"` → vazio (valor trocado de coluna; não inferível).
  4. C0055 — Assinaturas `"2 ESTAMPA"` → vazio (idem).
- **Produto final:** `web/data/products.json` contém **139 produtos**
  (135 reais + 4 samples), confirmado programaticamente (`node -e` sobre o
  JSON gerado).
- A discrepância "139 produtos" citada no `README.md` original do cliente
  se refere, na verdade, ao total incluindo os 4 itens de demonstração —
  não é um erro do README quando lido com este contexto, mas o número real
  de **cédulas com cadastro confirmado é 135**, conforme a régua de dados
  do megaprompt (planilha > código > README).

---

## 6. Lista de Arquivos Criados/Modificados

### Documentação e auditoria (raiz do repositório)
- `data-quality-log.md`, `data-quality-log.json` — log de correções de dados.
- `RELATORIO-FINAL-EXECUCAO.md` — este relatório.

### App Next.js (`web/`)
- **Config:** `next.config.mjs`, `jsconfig.json`, `package.json`, `.eslintrc.json`, `.gitignore`
- **Layout/estilo:** `app/layout.js`, `app/globals.css`
- **Dados:** `web/data/{products,categories,filtros,posts,reviews,blog-contents}.json`
- **Libs:** `lib/config.js`, `lib/data.js`, `lib/cart.js`, `lib/useReveal.js`
- **Componentes:** `components/{Icon,Header,Footer,ProductCard,FeatureStrip,OrnamentDivider}.js`
- **Páginas (11 rotas do protótipo + 2 placeholders):**
  - `app/page.js` (Home)
  - `app/catalogo/{page.js,CatalogClient.js}`
  - `app/produto/[slug]/{page.js,ProductClient.js}`
  - `app/not-found.js`
  - `app/carrinho/page.js`
  - `app/checkout/page.js`
  - `app/sobre/page.js`
  - `app/autenticidade/{page.js,AuthenticityClient.js}`
  - `app/diario/{page.js,BlogClient.js}`
  - `app/diario/[slug]/{page.js,BlogPostClient.js}`
  - `app/contato/page.js`
  - `app/conta/page.js`
  - `app/politica-de-privacidade/page.js` (novo, placeholder)
  - `app/termos-de-uso/page.js` (novo, placeholder)
- **Assets:** `public/assets/**` (logo, favicons, retratos, imagens de produto/blog — cópia integral de `design_files/assets`)

Total: **90 arquivos** adicionados no commit da PR (`git diff --stat` contra `main`).

---

## 7. Validação Executada

- ✅ `npm run build` (Next.js 14.2.35) — **sucesso**, 0 erros.
  - 160 páginas estáticas geradas (135 páginas de produto + páginas de
    blog + páginas institucionais + 404).
  - Avisos de lint não-bloqueantes: uso de `<img>` em vez de `next/image`
    em 2 pontos (`app/conta/page.js`, miniaturas de pedido) — aceitável
    para thumbnails pequenos e mockados; fonte custom no `layout.js`
    (padrão esperado no App Router, aviso é falso-positivo de regra
    legada de `pages/`).
- ✅ Smoke test via `python3 -m http.server` servindo `web/out/`:
  - `/`, `/conta/`, `/catalogo/`, `/produto/1-cruzeiro-1944-c0001/`,
    `/politica-de-privacidade/`, `/termos-de-uso/` → **HTTP 200**.
  - `/produto/produto-que-nao-existe/` → **HTTP 404** (Melhoria 8 confirmada).
- ✅ Verificação programática de `products.json`: 139 total, 135 reais + 4 samples.

### Não executado neste ciclo (fora do orçamento/escopo)
- Testes end-to-end automatizados (Playwright/Cypress) — não solicitados no megaprompt.
- Deploy real em ambiente Hostinger do cliente — depende de credenciais/acesso não fornecidos.

---

## 8. Próximos Passos Recomendados (Fase Futura)

1. **Confirmar o plano de hospedagem Hostinger real do cliente.** Se
   suportar Node.js, considerar migrar de `output: 'export'` para SSR/ISR
   e mover checkout/frete para API routes server-side (mais seguro para
   cálculo de preços e menos exposto a manipulação client-side).
2. **Cadastro real da aba "Moedas"** — assim que o cliente fornecer os
   dados reais de moedas/acessórios, remover a flag `isSample`/substituir
   os 4 itens de demonstração por produtos reais com estoque correto.
3. **Melhoria 3 (autenticação real)** — implementar backend de auth
   (ex.: NextAuth + banco de usuários), aproveitando o campo `passwordHash`
   já reservado no comentário de `app/conta/page.js`.
4. **Melhoria 11 (submissão real do formulário de contato)** — integrar
   com serviço de e-mail transacional (ex.: Resend, SendGrid) ou API route
   dedicada, quando a arquitetura de hospedagem permitir.
5. **Conteúdo jurídico definitivo** para `/politica-de-privacidade` e
   `/termos-de-uso`, a ser fornecido pelo jurídico do cliente.
6. **Confirmar com o cliente as 4 correções de dados** listadas no
   `data-quality-log.md` (especialmente os campos de "Assinaturas ou
   chancelas" deixados vazios em C0006/C0055).

---

## 9. Anexo — Log de Qualidade de Dados

Ver arquivo completo: [`data-quality-log.md`](./data-quality-log.md)

Resumo das 4 correções + observação sobre a aba Moedas vazia (reproduzido
na Seção 5 deste relatório).

---

## 10. Definição de Pronto (Section 12 do megaprompt) — Checklist Final

- [x] Build de produção sem erros (`npm run build` ✅)
- [x] Fidelidade visual ao protótipo (design system `styles.css` copiado
      literalmente; estrutura de cada página recriada 1:1 a partir do HTML original)
- [x] Arquitetura compatível com Hostinger (export estático, documentado)
- [x] Rotas dinâmicas funcionando (`/produto/[slug]`, `/diario/[slug]` com `generateStaticParams`)
- [x] Dados coerentes com a planilha real (135 cédulas + 4 itens sample marcados e ocultos)
- [x] Relatório Final entregue (este documento)
- [x] Pull Request criado: https://github.com/Derek-PCoelho/Lazecca/pull/1

---

## 11. Fase 8 (adendo) — Backend Real, Painel Admin, Mercado Pago Pré-implementado e Deploy em Produção

> Esta seção documenta o ciclo de trabalho posterior ao Relatório Final original (Seções 1–10 acima), que migrou o site de `output: 'export'` (estático) para `output: 'standalone'` (Node.js real) com banco de dados MySQL de produção, e concluiu o **deploy real no servidor Hostinger do cliente**.

### 11.1 O que foi implementado

- **Backend real completo**: autenticação (JWT + bcrypt, cookie `lz_session`),
  carrinho persistente (guest + usuário logado, com merge automático no login),
  pedidos com transação atômica (`Order` + `OrderItem` + baixa de estoque),
  frete (Melhor Envio com fallback para tabela fixa), e-mail transacional
  (Nodemailer com fallback para console quando SMTP não configurado).
- **Mercado Pago pré-implementado em modo simulado** (`lib/mercadopago.js`):
  todas as funções (`createPixPayment`, `createCardPayment`, `createBoletoPayment`,
  `getPaymentStatus`) retornam dados simulados (`simulated: true`) enquanto
  `MERCADOPAGO_ACCESS_TOKEN` estiver vazio. **Nenhuma alteração de código será
  necessária** quando o cliente criar a conta Mercado Pago e fornecer as chaves —
  basta preenchê-las nas variáveis de ambiente.
- **Painel administrativo completo** em `/admin` (protegido por `requireAdmin()`):
  dashboard com métricas, gestão de produtos, pedidos (com mudança de status) e
  mensagens de contato.
- **Migração de todas as páginas** de dados estáticos (JSON) para consultas
  reais ao Prisma/MySQL: home, catálogo, produto, diário/blog, conta, contato.
- **Banco de dados MySQL de produção** (`u610602689_lazecca_db` no servidor
  Hostinger `srv817.hstgr.io`) populado via `prisma/seed.js`: 139 produtos,
  4 categorias, 10 posts do blog, 3 avaliações, 1 usuário administrador.
- **Correção de segurança crítica**: `.env` (com `DATABASE_URL`/`JWT_SECRET`
  reais) não estava coberto pelo `.gitignore` anterior (só `.env*.local`
  estava listado). Corrigido antes de qualquer commit — confirmado via
  `git ls-files` que o segredo nunca chegou a ser versionado.
- **Pull Request**: https://github.com/Derek-PCoelho/Lazecca/pull/2

### 11.2 Deploy real em produção (Hostinger)

O deploy foi executado via **API oficial da Hostinger** (`developers.hostinger.com`),
usando um token de API fornecido pelo usuário nesta sessão (não persistido em
nenhum arquivo do repositório):

1. **Empacotamento do código-fonte** (não do build compilado) em um `.zip`,
   excluindo `node_modules/`, `.next/`, `.git/` e `.env`.
2. **Upload via protocolo TUS** (resumable upload) ao `public_html` do site
   `lazecca.com.br`, usando `POST /api/hosting/v1/files/upload-urls` para obter
   credenciais temporárias e depois `POST`+`PATCH` diretos ao endpoint TUS.
3. **Configuração das variáveis de ambiente de produção** via
   `PUT /api/hosting/v1/accounts/{username}/websites/{domain}/nodejs/builds/settings/env`
   — as mesmas chaves do `.env` local (exceto as de Mercado Pago/Melhor
   Envio/SMTP, que ficam **ausentes** em produção até o cliente preenchê-las;
   a API rejeita valores de string vazia, então essas variáveis simplesmente
   não são enviadas, e o código já trata sua ausência como "modo fallback/simulado").
4. **Build remoto disparado via API** (`POST .../nodejs/builds`), que a própria
   Hostinger executa no servidor (`npm install && next build`), detectando
   automaticamente `app_type: "next"` a partir do `package.json` enviado.
5. **Duas tentativas de build falharam inicialmente** com
   `Environment variable not found: DATABASE_URL` durante a pré-renderização
   das rotas `/api/products` e `/api/categories` — isso ocorreu porque essas
   tentativas rodaram *antes* da etapa 3 (variáveis de ambiente) ter sido
   concluída no servidor. Assim que as variáveis foram salvas, um build
   subsequente (dado a mesma configuração) **completou com sucesso**.
6. **Verificação pós-deploy em produção real** (`https://lazecca.com.br`):
   - Todas as páginas testadas retornaram **HTTP 200**: `/`, `/catalogo`,
     `/diario`, `/sobre`, `/autenticidade`, `/conta`, `/contato`, `/carrinho`,
     `/checkout`, `/admin/login`, `/politica-de-privacidade`, `/termos-de-uso`,
     `/produto/[slug]`.
   - `/api/products` retornou os **135 produtos reais + 4 categorias** do
     banco de dados de produção (confirma conexão MySQL funcionando em runtime).
   - Login administrativo testado com sucesso (`role: "ADMIN"` confirmado).
   - Registro de conta de cliente testado com sucesso.
   - Formulário de contato testado com sucesso (`{"ok":true}`).
   - Carrinho de convidado testado com sucesso: adição de item com controle
     de estoque real (bloqueio corretamente retornado para produto sem
     estoque, sucesso para produto com estoque disponível).
   - **Dados de teste removidos** do banco de produção após a verificação
     (usuário de teste, mensagem de contato de teste) — banco final
     verificado com 1 usuário (admin), 139 produtos, 4 categorias, 0 pedidos,
     0 mensagens.

### 11.3 Pendências remanescentes (fora do escopo desta sessão)

- **Ativação final do Mercado Pago**: o cliente precisa criar a conta em
  https://www.mercadopago.com.br/developers/panel/app e fornecer
  `MERCADOPAGO_ACCESS_TOKEN`/`MERCADOPAGO_PUBLIC_KEY` (produção ou `TEST-`
  para sandbox). Basta configurá-las nas variáveis de ambiente do Node.js
  no hPanel (ou via API) e rodar um novo build — nenhuma mudança de código
  é necessária.
- **Frete real (Melhor Envio)** e **e-mail transacional real (SMTP)**:
  mesma lógica — preencher `MELHOR_ENVIO_TOKEN` e `SMTP_HOST`/`SMTP_USER`/
  `SMTP_PASSWORD` quando disponíveis; até lá, o sistema usa os fallbacks
  já implementados (tabela de frete fixa / log no console).
- **Rotação de credenciais recomendada**: como o token de API da Hostinger
  e a senha do hPanel foram compartilhados em texto puro no chat em uma
  sessão anterior, recomenda-se fortemente ao cliente rotacionar essas
  credenciais no painel da Hostinger.
- **Testes end-to-end mais aprofundados** (fluxo completo de checkout até
  confirmação simulada de pagamento, testes de carga, testes de acessibilidade
  automatizados) não foram executados nesta sessão — apenas smoke tests
  manuais via `curl` nas rotas e fluxos principais.

---

## 12. Fase 9 (adendo) — Blocos 1-10: Conta/Pedidos, Estoque, Segurança (parcial)

Continuação do trabalho pós-deploy, cobrindo o pedido consolidado em 10
blocos (Bloco 1 a Bloco 10). Trabalho entregue em três Pull Requests
sequenciais: PR #2 (base, mergeado), PR #3 (frete real + validações,
mergeado) e **PR #4** (este ciclo).

### 12.1 Bloco 1 (conclusão) — Dashboard de Minha Conta

- `/conta` reestruturada como dashboard com 5 abas reais — Pedidos,
  Favoritos, Certificados, Endereços, Dados Pessoais — substituindo os 5
  links mortos (`href="#"`) do protótipo original.
- `/conta/pedidos/[id]`: página de detalhes do pedido (itens com imagem e
  certificado, endereço de entrega, forma/status de pagamento, breakdown de
  valores, código de rastreio quando preenchido pelo admin, botão de
  cancelamento).
- Formulário de cadastro em `/conta` usa `lib/validation.js` (CPF, senha
  forte, e-mail, telefone) com mensagens de erro por campo.

### 12.2 Bloco 8 (fundação) — Cancelamento e estorno

- `POST /api/orders/[id]/cancel`: cancelamento pelo cliente, respeitando o
  prazo de arrependimento do CDC Art. 49 (7 dias corridos da compra),
  devolvendo o estoque de cada item em uma transação atômica.
- Painel admin: campo de código de rastreio + cancelamento com motivo
  obrigatório, também devolvendo estoque e marcando o pagamento como
  `REFUNDED` quando o pedido já estava pago.
- Schema: `trackingCode`, `cancelReason`, `cancelledAt` adicionados ao
  modelo `Order` (aplicado em produção via `prisma db push`).

### 12.3 Bloco 4 — Estoque (concorrência e reserva)

- `POST /api/orders`: decremento de estoque reescrito para usar
  **compare-and-swap** (`updateMany` com condição `stock >= quantidade`)
  dentro da transação — elimina a condição de corrida em compras
  simultâneas da última unidade de uma peça única. Quando outra pessoa já
  levou a peça, a API retorna `409` com mensagem clara para o comprador que
  perdeu a corrida.
- **Evidência de teste**: script de concorrência simulando 2 requisições
  simultâneas de compra da última unidade de um produto — resultado:
  apenas 1 compra teve sucesso, a outra recebeu 409, e o estoque final no
  banco nunca ficou negativo. (Script de teste temporário, não incluído no
  repositório.)
- Novo endpoint `POST /api/cron/release-expired-orders` (protegido por
  header `X-Cron-Secret`, validado contra `CRON_SECRET`): varre pedidos
  `AWAITING_PAYMENT` cujo prazo de Pix/boleto expirou, devolve o estoque de
  cada item e cancela o pedido automaticamente.
  - **Testado manualmente em produção local**: requisição sem header →
    `401`; com header incorreto → `401`; com header correto → `200` com
    `{"ok":true,"releasedCount":0,...}`.
  - **Pendência de infraestrutura (ação do cliente)**: este endpoint precisa
    ser agendado para rodar a cada 10-15 minutos por um disparador externo
    (cron do hPanel Hostinger, ou serviço gratuito como cron-job.org
    apontando para `https://lazecca.com.br/api/cron/release-expired-orders`
    com o header `X-Cron-Secret` configurado). Isso não pode ser concluído
    a partir do código — requer acesso ao painel do cliente.
- Decisão de negócio documentada em `lib/data.js`: peças esgotadas
  permanecem visíveis no catálogo (marcadas "Esgotado"), nunca
  ocultadas/removidas, por serem peças únicas e não repostas — mantendo
  valor de portfólio/SEO mesmo após a venda.

### 12.4 Bloco 5 — Segurança

**Itens implementados e verificados nesta etapa:**

- **Cabeçalhos HTTP de segurança** (`next.config.mjs` → `async headers()`):
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  e uma `Content-Security-Policy` moderada (compatível com estilos inline
  usados no site e com o runtime do Next.js).
  **Evidência**: `curl -I` contra build de produção local (`next start`)
  confirmou todos os 6 cabeçalhos presentes na resposta.
- **Rate limiting** (`lib/rateLimit.js`, em memória, por IP):
  - `/api/auth/login`: máx. 10 tentativas / 15 min por IP.
  - `/api/auth/register`: máx. 20 cadastros / hora por IP.
  - `/api/auth/forgot-password`: máx. 5 solicitações / hora por IP.
  - **Evidência**: 12 requisições consecutivas contra `/api/auth/login` com
    credenciais inválidas → as 10 primeiras retornaram `401` (credenciais
    incorretas), a 11ª e 12ª retornaram `429` (limite excedido), com header
    `Retry-After`.
  - **Limitação conhecida e documentada no código**: a implementação é em
    memória (por processo Node), adequada ao deploy atual (`next start`
    single-process na Hostinger). Se o app migrar para múltiplas
    instâncias/serverless no futuro, será necessário um armazenamento
    compartilhado (Redis, banco, etc.).
- **Assinatura de webhook do Mercado Pago** (`lib/mercadopago.js` →
  `verifyWebhookSignature`): implementada a validação HMAC-SHA256 conforme
  especificação oficial do Mercado Pago (`x-signature` + `x-request-id`).
  Enquanto `MERCADOPAGO_WEBHOOK_SECRET` não for preenchido, a verificação é
  pulada (mesmo comportamento "modo simulado" do restante da integração);
  assim que o cliente configurar o segredo no painel do Mercado Pago e na
  variável de ambiente, toda notificação passa a ser validada, e
  notificações forjadas são rejeitadas com `401`.
- **Checagem de vazamento de variáveis de ambiente sensíveis no bundle
  client**: `grep` em `.next/static` (após build de produção) por
  `DATABASE_URL`, `JWT_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`,
  `MERCADOPAGO_WEBHOOK_SECRET`, `CRON_SECRET`, `SMTP_PASSWORD` — **nenhuma
  ocorrência encontrada**. Também confirmado por varredura de todos os
  arquivos `'use client'` que nenhum usa `process.env.*` fora do prefixo
  `NEXT_PUBLIC_*` (única forma seria exposição correta e intencional).
- **`npm audit`**: aplicado `overrides` no `package.json` para elevar
  `postcss` → `8.5.28` e `glob` → `10.5.0`, eliminando 4 das 5
  vulnerabilidades reportadas (XSS/path-traversal do PostCSS e injeção de
  comando do glob usado apenas em ferramentas de lint, não em runtime).
  Restou **1 vulnerabilidade crítica** relativa ao próprio `next@14.2.35`
  (diversas CVEs corrigidas apenas a partir do `next@15.5.10`/`16.x`) — a
  correção completa exigiria upgrade de major version (mudança de ruptura,
  fora do escopo deste ciclo por exigir testes de regressão completos);
  build (`next build`) foi reverificado com sucesso após os overrides
  aplicados.
- **HTTPS em produção**: confirmado via `curl -I https://lazecca.com.br/`
  → `HTTP/2 200`, e `curl -I http://lazecca.com.br/` → `301` redirecionando
  para a versão HTTPS. HSTS ativo tanto pelo cabeçalho aplicado pelo Next.js
  quanto pela CDN da Hostinger.
- **Confirmação de JWT/logout**: `lib/auth.js` já assina JWT com expiração
  de 7 dias (`JWT_EXPIRES_IN`) e usa cookie `httpOnly` + `sameSite: 'lax'`
  (mitigação CSRF parcial); `POST /api/auth/logout` limpa o cookie de sessão
  corretamente (`clearSessionCookie()`), efetivamente invalidando a sessão
  no navegador. Nenhuma alteração de código foi necessária — apenas
  confirmação.
- **Proteção de rotas admin**: reconfirmada nesta etapa — proteção em duas
  camadas (redirecionamento em `layout.js` para não-admin no lado servidor;
  `requireAdmin()` chamado em toda rota `/api/admin/*`).

**Itens do Bloco 5 que permanecem pendentes** (dependem de acesso externo
ou de decisão do cliente, não apenas de código):
- Upgrade major do Next.js para eliminar a última vulnerabilidade crítica
  restante do `npm audit` (mudança de ruptura — recomenda-se planejar como
  tarefa dedicada, com bateria de regressão completa).
- CSRF: mitigação atual (`sameSite: 'lax'`) é considerada adequada para o
  perfil de risco do site (não há endpoints GET que alterem estado); não
  foi adicionado token CSRF explícito por não haver indício de necessidade
  adicional, mas fica registrado como possível endurecimento futuro.

### 12.5 Bloco 3 — Testes funcionais ponta a ponta

**Pendência explícita**: a especificação original do Bloco 3 pede teste de
"migração do carrinho de convidado para o carrinho autenticado no login",
mas o carrinho de convidado foi **intencionalmente removido** em etapa
anterior deste projeto (a pedido explícito do cliente/orientador da tarefa,
para simplificar o controle de estoque — login agora é exigido antes de
adicionar itens ao carrinho). Este sub-item específico do Bloco 3 não pode
ser executado como descrito originalmente e requer confirmação do cliente
sobre se a intenção era testar o fluxo atual (carrinho sempre autenticado)
ou se o carrinho de convidado deveria ser reintroduzido.

### 12.6 Blocos ainda não iniciados neste ciclo

- **Bloco 2** (SMTP real): bloqueado por falta de credenciais SMTP do
  cliente — sistema já pré-implementado, basta preencher
  `SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD` em produção.
- **Bloco 7** (LGPD/cookie banner): conteúdo legal completo e banner de
  consentimento de cookies ainda não implementados.
- **Bloco 9** (SEO): sitemap.xml, robots.txt, meta tags por página e
  schema.org (JSON-LD) ainda não implementados.
- **Bloco 10** (checagens finais): confirmação de link do WhatsApp,
  confirmação final de remoção de artefatos do login fake do protótipo
  antigo, e confirmação do backup do MySQL no painel Hostinger — pendentes.

### 12.7 Evidências de build

- `next build` executado com sucesso após cada conjunto de alterações deste
  ciclo (Bloco 1/8, depois Bloco 4/5). Última verificação: build limpo após
  os `overrides` de dependências do `npm audit`, com todas as rotas novas
  (`/api/orders/[id]/cancel`, `/conta/pedidos/[id]`,
  `/api/cron/release-expired-orders`) presentes no manifesto de rotas.
- Testes manuais via `curl` contra build de produção local (`next start`)
  confirmaram: cabeçalhos de segurança presentes, rate limiting de login
  ativando corretamente no 11º request, e autenticação por segredo do
  endpoint de cron funcionando (`401`/`401`/`200` conforme esperado).
