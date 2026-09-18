# Handoff: Lazecca — E-commerce Numismático

## Overview

Lazecca (`lazecca.com.br`) é uma loja virtual de numismática especializada na venda de **cédulas e moedas antigas**, com curadoria especializada do Dr. Sergio Costa. O e-commerce tem foco em cédulas brasileiras do padrão Cruzeiro (1942-1967), com 135 exemplares cadastrados no momento da entrega, além de moedas brasileiras e estrangeiras selecionadas.

O design comunica sofisticação e tradição (paleta bordô + dourado antigo + pergaminho, tipografia serifada clássica) enquanto mantém uma experiência moderna e acolhedora para colecionadores iniciantes e experientes. Cada peça no catálogo tem **descrição narrativa contextualizada** (retrato retratado, contexto histórico do ano, significado de séries/carimbos/variedades) e as filtragens do catálogo são dinâmicas, refletindo apenas as opções que existem no acervo real.

## About the Design Files

Os arquivos deste pacote são **referências de design criadas em HTML** — protótipos completos que mostram a aparência e o comportamento pretendidos, **não código de produção para ser copiado diretamente**.

A tarefa do desenvolvedor é **recriar estes designs HTML no ambiente do codebase-alvo**, utilizando os padrões e bibliotecas já estabelecidos ali (React, Vue, Next.js, Nuxt, Svelte, etc.). Se ainda não houver um codebase, recomenda-se:

- **Framework**: Next.js 14+ (App Router) ou similar. Permite SSR/SSG (essencial para SEO de e-commerce), roteamento nativo, e boa integração com a maioria dos backends.
- **Estilização**: Tailwind CSS (com os design tokens documentados abaixo mapeados no `tailwind.config.js`) ou CSS Modules com CSS custom properties.
- **Backend**: qualquer stack que forneça API REST/GraphQL para produtos + carrinho + checkout. As integrações comuns brasileiras (Pagar.me, MercadoPago, PagSeguro, Stone) suportam PIX + cartão + boleto.
- **CMS de produtos**: Sanity, Strapi ou similar para permitir que o cliente atualize o cadastro de peças sem depender do desenvolvedor.

O JSX inline com Babel/React via CDN usado no protótipo **não deve ir para produção** — é apenas para o protótipo ser autônomo e navegável.

## Fidelity

**Alta fidelidade (hifi).** Os mocks representam pixel-perfect a aparência final desejada: cores exatas, tipografia definida, espaçamentos calibrados, hovers e transições implementados, layouts responsivos (breakpoint principal em 900px).

O desenvolvedor deve **recriar a UI pixel-perfect** no codebase-alvo, utilizando:
- Os design tokens listados na seção "Design Tokens"
- Os padrões visuais e de componentes descritos em "Screens / Views"
- As micro-interações documentadas em "Interactions & Behavior"

---

## Screens / Views

O e-commerce tem **11 páginas navegáveis** com header e footer consistentes.

### 1. Home (`index.html`)

**Propósito**: Apresentar a marca com foco na curadoria do Dr. Sergio e conduzir ao catálogo. Deliberadamente enxuta.

**Estrutura vertical** (nesta ordem exata — foi validado que o usuário quer o curador como primeira seção):

1. **Header sticky** (padrão em todas as páginas)
2. **Seção Curador** (fundo bordô `--burgundy-900`)
   - Grid 2 colunas (retrato à esquerda 380px + coluna de texto à direita)
   - Retrato ilustrado do Dr. Sergio (aquarela) em moldura com filete dourado, aspect-ratio 3/4
   - Eyebrow "QUEM CUIDA DO SEU ACERVO" em dourado
   - H1 "Dr. Sergio Costa" em Playfair Display, cor `--gold-500`
   - Blockquote em serifa itálica com borda dourada à esquerda
   - Parágrafo institucional em `--parchment`
   - Botão dourado "Conheça nossa história" → `about.html`
3. **Seção Hero** (fundo `--paper`)
   - Grid 2 colunas (copy à esquerda, imagem à direita, aspect-ratio 3/4)
   - Eyebrow "NUMISMÁTICA DE CURADORIA · DESDE 1998"
   - H1 gigante (clamp 48-84px) "Cada moeda é *uma história* que o tempo esqueceu de contar." — "uma história" em itálico dourado
   - Lede em serifa: descrição institucional (~2 linhas)
   - Dois botões: "Explorar o Acervo" (bordô primary) + "Sobre o Dr. Sergio" (ghost)
   - Imagem "Peça em Destaque" (moeda de ouro em escrínio de veludo bordô) com tag bordô no canto superior esquerdo
4. **Seção Categorias** (fundo `--paper-soft`)
   - Section head com eyebrow + h2 + link "Ver tudo →"
   - Grid 4×2 de cards de categoria (2 colunas em mobile)
   - Cada card: ícone circular bordô + nome + contagem de peças
5. **Seção CTA Final** (fundo `--paper`, centralizado)
   - H2 grande "Uma peça de cada vez, *um século de cada vez.*"
   - Parágrafo em serifa
   - Dois botões CTA
6. **Footer** (padrão em todas as páginas)

**Animações**: seções abaixo do fold têm classes `.reveal` ou `.reveal-stagger` que ativam via `IntersectionObserver` quando entram na viewport. Hero e Curador usam classes de fade-in imediato (`.fade-in-up`, `.fade-in-up-2`, `.fade-in-up-3`).

---

### 2. Catálogo (`catalog.html`)

**Propósito**: Explorar todo o acervo com filtros e paginação.

**Layout**: Grid 2 colunas — sidebar de filtros sticky (260px) + main com produtos.

**Sidebar de filtros** (posição sticky com `overflow-y: auto`):
- **Categoria**: lista clicável (Todas, Cédulas Brasileiras, Moedas Brasileiras, Moedas Estrangeiras, Acessórios, ★ Raridades) com contagens
- **Denominação** (só aparece se categoria = cédulas ou "Todas"): checkboxes com contagens reais do acervo — 1 CRUZEIRO (26), 2 CRUZEIROS (10), 5 CRUZEIROS (37), 10 CRUZEIROS (15), 20 CRUZEIROS (8), 50 CRUZEIROS (24), 100 CRUZEIROS (7), 200 CRUZEIROS (3), 10 CRUZEIROS (COM CARIMBO 1 CENTAVO) (4)
- **Ano de Emissão**: checkboxes com contagens (1944, 1953, 1954, 1955, 1956, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1966, 1967)
- **Estado de Conservação**: FE (85), SOB (43), MBC (5), BC (1) com labels legíveis ("Flor de Estampa (FE)", etc.)
- **Estampa / Família**: 1 Estampa, 2 Estampa
- **Tipo de Peça**: Todas / Em sequência numérica / Em lote (múltiplas) / Variedade autografada / ★ Raras
- **Faixa de Preço**: dois inputs numéricos (Min / Max) com hint "De R$ 4 a R$ 4.850"

**Toolbar (topo do main)**:
- Contador dinâmico à esquerda: "Exibindo 25–48 de 135 peças filtradas (139 no acervo)"
- Dois selects à direita:
  - **Exibir**: 12 / 24 / 48 / Todos por página (default 24)
  - **Ordenar**: Destaques / Menor preço / Maior preço / Mais antigas / Mais recentes / Por conservação

**Chips de filtros ativos** abaixo da toolbar, cada um com botão × para remover, e botão "Limpar todos os filtros".

**Grid de produtos**: `repeat(auto-fill, minmax(260px, 1fr))` com gap 28px.

**Paginação** compacta ao final quando `totalPages > 1`: `< 1 2 3 ... N >` com página ativa destacada em bordô. Clicar rola suave para topo. Mudar qualquer filtro reseta para página 1.

**Estado vazio**: se `filtered.length === 0`, mostra ícone de busca cinza + heading "Nenhuma peça corresponde a esses filtros" + botão "Limpar filtros".

---

### 3. Página de Produto (`product.html?id=<slug|id>`)

**Propósito**: Detalhar uma peça específica com contexto histórico e narrativa curatorial.

**Layout**: Breadcrumb no topo + grid 2 colunas (galeria à esquerda sticky, detalhes à direita).

**Coluna Galeria**:
- Imagem principal em aspect-ratio 1:1 com moldura dourada interna, tag "Frente" ou "Verso" (para cédulas) ou "Anverso"/"Reverso" (para moedas)
- Botão de zoom no canto inferior direito
- 4 thumbnails abaixo (2 lados + variações)

**Coluna Detalhes**:
- Linha de categoria com referência: "Cédulas Brasileiras · Brasil · Ref. C011"
- H1 do produto
- Pill "Retrato de {Figura} · {Período}" (quando é cédula com retrato mapeado)
- Selos: "★ Rara" / "🛡 Autenticada" / "Sequência de N" / "Lote de N" / "Autografada" / "{estado}"
- **Bloco de preço**: preço grande em bordô, opcional preço-riscado, "ou até 10× de R$ X sem juros no cartão", badge PIX com 5% de desconto
- **Ações de compra**: qty selector + "Adicionar ao carrinho" + botão favoritar
- **2 cards de garantia**: "Frete grátis" + "7 dias para trocar"
- **Card de Autenticidade** (gradiente bordô): ícone escudo + "Certificado de Autenticidade" + código do certificado
- **Ficha Técnica** (dl com fundo bordô no header): Denominação, Ano, Padrão Monetário, Estampa/Família, Série, Assinaturas, Variedade, País, Metal, Peso, Dimensões, Estado, Defeitos, Raridade, Exemplares no lote, Observações — só renderiza campos preenchidos

**Abas abaixo** (padrão inicial: "Descrição desta Cédula"):
1. **Descrição desta Cédula** (ou "Descrição da Peça" para moedas): texto narrativo específico do exemplar
2. **Contexto Histórico**: história do padrão + retrato + ano
3. **Estado de Conservação**: explicação do grau
4. **Envio e Devolução**: políticas

**Relacionados**: 4 outros produtos da mesma categoria no final.

---

### 4. Carrinho (`cart.html`)

**Propósito**: Revisar itens antes do checkout.

**Layout**: Grid 2 colunas — lista de itens (1.6fr) + resumo (1fr).

**Lista**: header com colunas "Peça / Quantidade / Total / (remover)", linhas com thumb + info + qty selector + total + botão ×. Rodapé com "← Continuar explorando" + campo de cupom.

**Resumo (sticky)**: subtotal, frete, desconto, calculadora de CEP, total grande em bordô, hint de parcelamento, badge PIX com preço à vista destacado, botão "Finalizar compra", strip de garantias (Autenticada / Envio Seguro / 7d Devolução).

**Estado vazio**: card centralizado com ícone de carrinho + CTA para catálogo.

---

### 5. Checkout (`checkout.html`)

**Propósito**: Finalizar compra em passos.

**Header simplificado** (sem nav completa): logo + "🛡 Compra 100% Segura · SSL".

**Steps bar** (fundo cream): Carrinho (done ✓) → Identificação & Entrega (active) → Pagamento → Confirmação

**Layout**: 2 colunas — formulários à esquerda + resumo do pedido à direita (sticky).

**3 painéis empilhados**:
1. **Identificação** (numerado 1 em círculo bordô): Nome + CPF + Email + Telefone + checkbox newsletter
2. **Endereço de Entrega** (2): CEP + Rua + Número + Complemento + Bairro + Cidade + Estado + Modalidade de envio (select com opções PAC, SEDEX, SEDEX 10, Retirar)
3. **Pagamento** (3): 3 cards de método (PIX destacado com 5% off / Cartão / Boleto), depois campos condicionais conforme método selecionado

**Resumo (direita, sticky)**: mini-cards dos itens, subtotal + frete + desconto + total, botão "Concluir Pedido".

---

### 6. Sobre (`about.html`)

**Propósito**: História da marca + curador.

**Estrutura**:
1. **Hero**: grid `minmax(340px, 440px) 1fr` — retrato à esquerda (aspect 3/4, moldura dourada) + copy à direita com h1 (clamp 34-54px, PROPORCIONAL — importante manter esse tamanho, foi calibrado), lede em serifa itálica, parágrafo institucional, e assinatura "Dr. Sergio Costa · Fundador · Curador-Chefe"
2. **Stats strip bordô** (rounded card): 27 anos / 2.400+ peças / 1.200+ colecionadores / 4,9★
3. **Manifesto** (fundo cream, centralizado, 720px max): "Colecionar é preservar." + 2 parágrafos em serifa
4. **Timeline** (max 720px): 5 marcos (1998, 2004, 2011, 2019, 2026) com dot dourado, ano em Playfair 28px, h4 e parágrafo. **Importante**: entrada de 2004 diz "Primeira loja física em Fortaleza / Rua do Pocinho" (NÃO São Paulo).
5. **Valores** (fundo cream): 3 cards (Autenticidade / Curadoria / Educação)
6. **CTA bordô**: "Recebemos peças em consignação" com botões WhatsApp + telefone

**Importante**: Não incluir seção "Equipe" com outros nomes. O único membro exibido é o Dr. Sergio Costa. A faixa branca de 96px entre o CTA bordô e o footer bordô foi reduzida para 24px via CSS `.bg-burgundy + .site-footer { margin-top: 24px }`.

---

### 7. Autenticidade (`authenticity.html`)

**Propósito**: Comunicar credibilidade e detalhar processo de autenticação.

**Estrutura**:
1. **Page hero** (bordô com gradiente radial)
2. **Processo em 4 etapas**: grid de 4 cards com número em círculo bordô no topo, ícone, título e descrição — Aquisição / Análise Técnica / Atribuição / Certificação
3. **Certificate Showcase** (fundo cream): grid 2 colunas — visualização estilizada de um certificado à esquerda (papel pergaminho com moldura dourada dupla, emblema circular no topo, título "Certificado de Autenticidade", assinatura à mão, lacre de cera bordô com "LZ" no canto), copy explicativa à direita
4. **Guarantee List** (5 garantias): items em card com ícone circular dourado + h4 + descrição
5. **FAQ**: accordion com 6 perguntas expansíveis, chevron rotativo

---

### 8. Diário Numismático — listagem (`blog.html`)

**Propósito**: Blog editorial com artigos do curador.

**Estrutura**:
1. **Page hero**: título + lede acolhedora (sem "sóbrio" ou jargão)
2. **Featured post**: grid 2 colunas — cover à esquerda (aspect 4/3) + copy à direita (categoria, h2, excerpt, meta autor/data/read-time, botão "Ler artigo")
3. **Chips de filtro** por categoria (Todos, Guias, História, Estética, Curiosidades)
4. **Grid 2 colunas** dos 9 posts restantes com cover 16/10, categoria, h3, excerpt, meta
5. **Newsletter card** ao final: fundo cream, texto acolhedor, input + botão

---

### 9. Diário — post individual (`blog-post.html?p=<slug>`)

**Propósito**: Renderizar artigo completo.

**Estrutura editorial**:
1. **Article hero** (fundo cream, centralizado): breadcrumb + pill categoria bordô + h1 (clamp 36-60px, centered) + lede + meta com avatar + autor + data + tempo de leitura
2. **Cover full-width** (max 1100px, aspect 21/9, box-shadow lg, posicionamento negativo para sobrepor o hero)
3. **Article body** (max 720px, centralizado): parágrafos em Cormorant Garamond 20px, dropcap no primeiro parágrafo (h1 gigante 72px flutuante à esquerda em bordô), h2/h3 em Playfair, blockquote com fundo cream e borda dourada, listas em serifa
4. **Share bar**: 4 ícones sociais circulares
5. **Author card**: avatar do Dr. Sergio + bio curta
6. **Related articles**: grid 3 colunas dos outros posts

**Conteúdo dos 10 artigos** está no arquivo `js/blog-contents.js` (objeto `window.LZ_BLOG_CONTENTS` indexado por slug). O corpo é HTML string injetada via `dangerouslySetInnerHTML` — em produção, mover para markdown/MDX ou para um CMS.

Os 10 artigos são:
1. `como-avaliar-conservacao` — FE, SOB, MBC, BC
2. `padrao-cruzeiro-1942` — 25 anos do padrão Cruzeiro
3. `cedulas-em-sequencia` — Por que sequências valem mais
4. `guia-armazenamento` — Como guardar cédulas
5. `padrao-mil-reis` — 105 anos do padrão Mil-Réis
6. `cedulas-com-carimbo-1967` — Reforma monetária de 1967
7. `assinaturas-tesouro-nacional` — Ministros da Fazenda que assinaram cédulas
8. `iniciando-uma-colecao` — Guia para iniciantes
9. `a-arte-do-guilloche` — A arte gráfica das cédulas
10. `como-autenticamos-uma-cedula` — Processo de autenticação

---

### 10. Contato (`contact.html`)

**Propósito**: Facilitar contato direto.

**Layout**: grid 2 colunas — info card à esquerda (canais diretos + card WhatsApp verde) + form card à direita.

**Info card**: 4 métodos (Telefone `(85) 9655-3044` / Email / Endereço `R. do Pocinho, 33 · Sala 425 · Fortaleza/CE` / Horário Seg-Sex 09h-16h).

**WhatsApp card** (gradiente verde WhatsApp): CTA "Conversar".

**Form card**: campos Nome / Email / Telefone / Assunto (select) / Mensagem, checkbox LGPD, botão submit. Ao enviar, mostra card de sucesso com check circular.

**Map placeholder** ao final: grid pattern com pin bordô animado (pulse) + card com endereço.

**Importante**: endereço e telefone **reais** do cliente — não alterar para São Paulo ou outros.

---

### 11. Minha Conta (`account.html`)

**Propósito**: Login/Cadastro E painel do usuário logado (alternância via `localStorage.lz_logged`).

**Modo Login (não logado)**: card centralizado 1080px, grid 2 colunas:
- **Lateral esquerda bordô**: emblema + h2 "Bem-vindo à casa dos colecionadores" + blockquote do curador + lista de perks
- **Lateral direita**: tabs "Entrar" / "Criar Conta" + formulário + divider "ou entrar com" + botões social (Google / Facebook)

**Modo Dashboard (logado)**: grid 2 colunas:
- **Sidebar (260px)**: card com avatar + nome + email + menu vertical (Meus Pedidos ativo, Favoritas, Certificados, Endereços, Dados pessoais, Preferências) + "Sair da conta"
- **Main**: dash header + cards de pedidos (número, data, status pill, thumbs dos itens, total, botões "Baixar Certificado" + "Ver detalhes")

---

### Componentes Compartilhados

#### Header (todas as páginas)

- **Top bar bordô 900**: texto "Curadoria numismática · desde 1998" à esquerda, links "Autenticidade garantida | (85) 9655-3044 | Minha Conta" à direita. Font 12px, letter-spacing 0.06em.
- **Main bar**: grid 3 colunas — **logo à esquerda** (obrigatório, foi corrigido — não centralizar), **busca ao centro** (max 480px, radius-full, foco animado dourado), **ícones à direita** (user, heart, cart com badge de contador). Height ~90px total.
- **Nav primary**: 6 links CENTRAIS com uppercase 13px, letter-spacing 0.14em (Início / Catálogo / Diário / Sobre / Autenticidade / Contato). Underline dourado animado no hover. Item ativo destacado.

**Sticky** com `backdrop-filter: blur(10px)` e background rgba(245,239,228,0.94).

#### Footer (todas as páginas exceto checkout)

- **Top**: grid 4 colunas — Brand (logo + nome + descrição + 3 ícones sociais) / Catálogo (links) / Institucional (links) / Atendimento (contatos)
- **Bottom**: copyright + payment methods badges (PIX / VISA / MASTER / AMEX / BOLETO)

Fundo bordô 900, texto em `--cream`.

**Regra especial**: quando a página termina em uma seção `.bg-burgundy`, o footer tem `margin-top: 24px` (em vez do 96px padrão) para evitar faixa clara enorme.

#### Product Card

Componente central usado em múltiplas telas:
- **Imagem** em aspect-ratio 1:1 com fundo cream, imagem centralizada 88% com hover-zoom
- **Selos** no canto superior esquerdo (empilhados): ★ Rara / 🛡 Autenticada / Sequência de N / Lote de N
- **Quickview** ("Ver detalhes →") aparece no hover no rodapé da imagem
- **Body**: categoria uppercase, nome em Playfair, meta (ano + estado + série), price footer com preço em Playfair bordô + botão "Comprar" outline

---

## Interactions & Behavior

### Roteamento
Paginação é feita por HTML separado + query strings (`?id=<slug>`, `?cat=<slug>`, `?p=<postslug>`). Em Next.js, mapear para:
- `/` → Home
- `/catalogo` (params: `?cat`, `?sort`, `?page`) → Catálogo
- `/produto/[slug]` → Produto
- `/carrinho` → Carrinho
- `/checkout` → Checkout
- `/sobre` → Sobre
- `/autenticidade` → Autenticidade
- `/diario` → Blog listagem
- `/diario/[slug]` → Post
- `/contato` → Contato
- `/conta` → Minha conta

### Estado (client-side)
- **Cart**: persistido em `localStorage.lz_cart` como `[{id, qty}]`. Custom event `lz-cart-changed` dispara re-renders no badge do header. Em produção, sincronizar com backend.
- **Auth mock**: `localStorage.lz_logged` = "1" para simular login. Em produção, JWT/session cookie.
- **Filtros do catálogo**: `useState` com `Set` para checkbox groups, string para radios/single, dois `useState` para price min/max. `useEffect` reseta paginação para 1 ao mudar filtros.

### Animações
- **Reveal on scroll**: `IntersectionObserver` (threshold 0.12, rootMargin `-60px`) adiciona `.in` em `.reveal` e `.reveal-stagger`. Definido em `data.js` como `window.LZ_initReveal()`, chamado no useEffect da Home.
- **Fade-in imediato**: classes `.fade-in`, `.fade-in-up`, `.fade-in-up-2`, `.fade-in-up-3` (delays escalonados 0s / 0.15s / 0.3s) para elementos above-the-fold.
- **Hover em botões**: shimmer diagonal (linear-gradient translateX -120% → 120% em 0.6s) + translateY -2px + box-shadow.
- **Card hover**: transform translateY(-2px) + border-color muda para gold-700 + box-shadow-md, cubic-bezier(0.34, 1.56, 0.64, 1).
- **Nav underline**: pseudo `::after` com scaleX 0 → 1 no hover (origin center).
- **Logo hover**: rotate(-4deg) + translateY(-1px).
- **Selo "Rara"**: animação `sealShimmer` infinita (box-shadow pulsante dourado).
- **Category chip icon hover**: rotate(-8deg) + scale(1.08) + inverte cores (bordô→dourado).

**Respeita `prefers-reduced-motion`**: `animation-duration: 0.01ms` para todos.

### Formulários

- **Contato**: submit fake que troca para card de sucesso via `useState`
- **Login/Signup**: submit fake que grava `lz_logged=1` e muda para dashboard
- **Newsletter**: submit fake, apenas `preventDefault`

Em produção, todos precisam integrar com backend real.

### Paginação do catálogo

- Selector "Exibir": 12 / 24 / 48 / `Infinity` (Todos). Default 24.
- `totalPages = Math.ceil(filtered.length / perPage)` (ou 1 se Infinity)
- Botões `<` e `>` desabilitam nos limites
- Lista compacta com `...` quando `totalPages > 7`
- Clique em página faz `window.scrollTo({top: 0, behavior: 'smooth'})`
- Mudança de qualquer filtro ou `perPage` reseta para página 1

### PIX + Parcelamento
- Preço à vista PIX = preço × 0.95 (5% de desconto)
- Cartão: 10× sem juros exibido como opção padrão

---

## State Management

Para produção com Next.js/React, sugerir:

- **Carrinho**: Zustand ou Jotai (leve) OU Redux Toolkit (se app crescer). Persistência em localStorage + sync opcional com backend por hash de sessão anônima.
- **Auth**: NextAuth.js ou Clerk. Guardar JWT/session, expor hook `useUser()`.
- **Produtos**: fetch server-side (SSG revalidate a cada 5-10 min) para catálogo/produto, com filtros client-side (aceitável até ~5000 itens) OU server-side (URL params) se catálogo crescer muito.
- **Formulários**: React Hook Form + Zod para validação.

### Dados de produtos (schema atual)

```typescript
interface Product {
  id: string;                    // ex: 'C0001', 'p001'
  slug: string;                  // URL-friendly
  name: string;                  // ex: '1 Cruzeiro · 1944'
  denomination: string;          // ex: '1 CRUZEIRO'
  year: number;                  // ex: 1944 (negativo p/ a.C.)
  country: string;
  countryCode: string;
  metal: string;                 // ex: 'Papel-moeda', 'Ouro 917/1000'
  weight: string;                // ex: '17,92g' | '—'
  diameter: string;              // ex: '30 mm' | '—'
  state: string;                 // curto: 'FE', 'SOB', 'MBC'
  stateShort: string;            // idem
  stateFull: string;             // 'FE - Flor de Estampa'
  stateLabel: string;            // tag: 'Praticamente nova'
  category: 'cedulas-br' | 'moedas-br' | 'moedas-int' | 'acessorios';
  categoryName: string;
  price: number;                 // em reais
  priceOld: number | null;
  image: string;                 // path
  seals: ('rare' | 'authenticated')[];
  rarity: string;                // 'Rara', 'Comum', 'Boa', etc.
  padrao: string;                // ex: 'Cruzeiro (1942-1967)'
  periodo: string;               // ex: 'Estado Novo'
  figura: string;                // retrato: 'Marquês de Tamandaré'
  estampa: string;               // '1 ESTAMPA' | '2 ESTAMPA'
  serie: string;
  assinaturas: string;
  variedade: string;             // 'Normal' | 'Autografada'
  defeitos: string;              // ex: 'Dobra; Mancha'
  quantidade: number;
  isSequencia: boolean;
  observacoes: string;
  referenciaCatalogo: string;    // ex: 'C011'
  description: string;           // narrativa curatorial
  history: string;               // contexto histórico
  certificate: string;           // código LZ-YYYY-Ref-ID
  shipping: string;              // ex: 'Frete grátis'
}
```

---

## Design Tokens

### Cores (CSS custom properties em `:root`)

```css
/* Bordô — cor primária */
--burgundy-950: #2E0C11;
--burgundy-900: #4A1420;   /* headers, footer, seções bordô */
--burgundy-800: #5B1A26;
--burgundy-700: #6B1F2A;   /* PRIMARY — botões, texto realçado */
--burgundy-600: #832935;
--burgundy-500: #9B3542;
--burgundy-100: #F0DDE0;

/* Dourado — cor de acento */
--gold-900: #7A6432;
--gold-800: #A88A4A;
--gold-700: #C9A961;       /* ACCENT — bordas, hovers */
--gold-600: #D4B876;
--gold-500: #E4CD97;       /* texto sobre bordô */
--gold-100: #F5EBD1;       /* fundos sutis */

/* Neutros pergaminho */
--paper: #F5EFE4;          /* fundo principal do site */
--paper-soft: #FBF7EE;     /* fundo alternativo */
--cream: #EDE4D3;          /* fundo de imagens/cards */
--cream-warm: #E5D8BF;
--parchment: #DFD3B8;      /* texto sobre bordô */

/* Tinta / texto */
--ink-950: #1F1613;        /* headings */
--ink-800: #2B211D;        /* body */
--ink-700: #3D2F28;
--ink-500: #6B5A50;        /* meta, secundário */
--ink-400: #8B7B70;        /* placeholders */
--ink-300: #B3A79B;
--line: #D9CFC0;           /* bordas */
--line-soft: #E6DECD;      /* bordas mais suaves */

/* Estados */
--success: #4F7A4E;
--danger: #A0322A;
```

### Tipografia

```css
--font-serif: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
--font-display: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

**Google Fonts URL:**
```
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap
```

**Escala tipográfica:**
- `h-display`: clamp(48px, 6vw, 88px), font-weight 500, letter-spacing -0.02em
- `h1`: clamp(36px, 4vw, 56px)
- `h2`: clamp(28px, 3vw, 40px)
- `h3`: clamp(20px, 2vw, 26px)
- `h4`: 18px, sans, weight 600
- `body`: 16px, sans, line-height 1.55
- `lede`: 20px, serif italic, line-height 1.6
- `eyebrow`: 11px sans, uppercase, letter-spacing 0.22em, gold-800

Todos os headings usam **Playfair Display** (font-display) em weight 500, letter-spacing -0.01em, line-height 1.15, `text-wrap: balance`.

### Espaçamento

Sistema informal (não é escala 8px rígida):
- Padding container: 32px desktop, 20px mobile
- Section padding: 88px vertical (56px tight, 0 hero)
- Card padding: 18-32px conforme card
- Gap entre grids: 16-64px

### Radius

```css
--radius-sm: 4px;
--radius: 6px;              /* padrão de botões e inputs */
--radius-md: 10px;          /* cards */
--radius-lg: 16px;          /* imagens grandes, hero */
--radius-full: 999px;       /* pills, chips */
```

### Sombras

```css
--shadow-sm: 0 1px 2px rgba(31,22,19,0.06), 0 1px 3px rgba(31,22,19,0.04);
--shadow-md: 0 4px 12px rgba(31,22,19,0.08), 0 2px 4px rgba(31,22,19,0.04);
--shadow-lg: 0 12px 32px rgba(31,22,19,0.12), 0 4px 8px rgba(31,22,19,0.06);
```

### Container

- `--container: 1280px` (padrão)
- `--container-narrow: 960px` (páginas de conteúdo)

### Ícones

Sistema de ícones customizado como componente React (`<Icon name="..." size={20} />`) com strokes SVG stroke-width 1.5, stroke-linecap round. Ver `js/components.jsx` para lista completa (search, user, heart, cart, menu, coin, bill, star, kit, lens, gem, shield, truck, award, refresh, chevron-*, x, plus, minus, check, phone, mail, map-pin, clock, zoom-in, quote, sparkles, facebook, instagram, whatsapp, pix, sliders).

Em produção, migrar para **Lucide Icons** (lucide-react) que tem ~99% desses ícones já implementados de forma consistente.

---

## Assets

### Imagens principais (13 cédulas + 4 legado + 10 blog + 3 brand)

**Marca (3 arquivos):**
- `assets/logo-emblem.png` — Emblema circular com Dr. Sergio (usado no header/footer)
- `assets/favicon-*.png` (4 tamanhos: 32, 48, 180, 256) — Emblema simplificado sem rosto (só coroa de louros + estrela + "LA ZECCA" arqueado, bordô + dourado, cortado circularmente por canvas). O favicon 1024x1024 original (`favicon-source.png`) é o mesmo emblema em resolução máxima.
- `assets/dr-sergio-portrait.png` — Retrato editorial em aquarela do Dr. Sergio Costa
- `assets/hero-featured-coin.png` — Composição cinematográfica: moeda de ouro imperial (20.000 Réis, Dom Pedro II) em escrínio de veludo bordô com lupa de latão

**Produtos — cédulas do Cruzeiro (13 arquivos em `assets/products/`):**
- `cruzeiro-1-1estampa.png` — Tamandaré, azul-teal
- `cruzeiro-2-1estampa.png` — Caxias 1ª estampa, marrom-vermelho
- `cruzeiro-2-2estampa.png` — Caxias 2ª estampa, redesenho
- `cruzeiro-5-2estampa.png` — Rio Branco, azul-violeta
- `cruzeiro-10-1estampa.png` — Vargas 1ª estampa, verde-oliva
- `cruzeiro-10-2estampa.png` — Vargas 2ª estampa, verde-laranja
- `cruzeiro-20-2estampa.png` — Pedro I, carmim
- `cruzeiro-50-1estampa.png` — Princesa Isabel 1ª estampa, violeta
- `cruzeiro-50-2estampa.png` — Princesa Isabel 2ª estampa, violeta-teal
- `cruzeiro-100-1estampa.png` — Pedro II 1ª estampa, marrom-verde
- `cruzeiro-100-2estampa.png` — Pedro II 2ª estampa
- `cruzeiro-200-1estampa.png` — Caxias 200 Cr, sépia-oliva
- `cruzeiro-10-carimbo-centavo.png` — 10 Cr com carimbo vermelho "1 CENTAVO" (reforma 1967)

**Produtos legado (5 arquivos):**
- `moeda-ouro-20000-reis.png` — 20.000 Réis Ouro Império 1889
- `morgan-dollar-1885.png` — Morgan Dollar 1885-O
- `denario-romano.png` — Denário de Adriano
- `album-numismatico.png` — Álbum bordô com peças
- Outras imagens de produto que não estão no acervo atual mas ficaram como legado

**Blog covers (10 arquivos em `assets/blog/`):**
- `artigo-conservacao.png` — Cédula com lupa
- `artigo-padrao-cruzeiro.png` — Timeline de cédulas
- `artigo-sequencias.png` — Macro dos números de série consecutivos
- `artigo-armazenamento.png` — Álbum + luvas + sílica
- `artigo-mil-reis.png` — Mil-Réis + moeda colonial + selo
- `artigo-carimbos.png` — Macro do carimbo "1 CENTAVO" vermelho
- `artigo-assinaturas.png` — Macro das assinaturas do Tesouro
- `artigo-iniciando-colecao.png` — Álbum organizado
- `artigo-guilloche.png` — Macro dos padrões ornamentais
- `artigo-autenticacao.png` — Certificado + selo de cera + lupa

**Origem das imagens**: Todas as imagens acima foram **geradas por IA** durante o design (modelos `nano-banana-pro` para cédulas com texto, `fal-ai/flux-2-pro` para composições editoriais dos artigos, `nano-banana-pro` para o logo e retrato). Para produção, o cliente deve substituir por **fotos reais das cédulas do acervo** — as imagens geradas são placeholders visualmente consistentes mas não representam os exemplares específicos.

**Recomendação para produção**: Contratar fotografia profissional para as ~15 famílias visuais de cédula (uma foto por combinação padrão×denominação×estampa) + fotos reais do Dr. Sergio + fotos reais do interior da loja em Fortaleza.

---

## Files

Arquivos incluídos neste pacote (em `design_handoff_lazecca_ecommerce/design_files/`):

### HTML pages (11 páginas)
- `index.html` — Home
- `catalog.html` — Catálogo com filtros e paginação
- `product.html` — Página de produto
- `cart.html` — Carrinho
- `checkout.html` — Checkout
- `about.html` — Sobre
- `authenticity.html` — Autenticidade
- `blog.html` — Blog listagem
- `blog-post.html` — Post individual
- `contact.html` — Contato
- `account.html` — Minha conta

### Support files
- `styles.css` — Design system completo (design tokens + componentes globais + animações)
- `js/data.js` — Dados dos 139 produtos + 10 posts + 3 reviews + helpers (`window.LZ`, `window.LZ_DATA`, `window.LZ_initReveal`)
- `js/components.jsx` — Header, Footer, ProductCard, Icon, FeatureStrip, OrnamentDivider (React JSX)
- `js/blog-contents.js` — Conteúdo HTML dos 10 artigos indexado por slug (`window.LZ_BLOG_CONTENTS`)

### Data source
- `data/cadastro-v2.xlsx` — Planilha original do cliente com o cadastro de 135 cédulas (fonte de verdade para os produtos)

### Notas importantes para o desenvolvedor

1. **Não copiar os arquivos HTML diretamente para produção.** Eles usam React via CDN + Babel standalone (bom para protótipo, ruim para performance real). Recrie em framework moderno com build step.

2. **Design tokens são a fonte de verdade das cores/tipografia.** Mapeie-os em `tailwind.config.js` ou em CSS custom properties no seu app.

3. **A ordem das seções da Home é intencional** (Curador → Hero → Categorias → CTA). Não invertê-la.

4. **Header: logo à esquerda, busca ao centro, ícones à direita.** Não centralizar o logo — foi corrigido explicitamente.

5. **Todas as páginas têm `<title>Lazecca Numismática</title>`** (não "Catálogo · La Zecca", etc.).

6. **Endereço e telefone reais**: R. do Pocinho, 33 · Sala 425 · Centro · Fortaleza/CE · CEP 60055-120 — Telefone (85) 9655-3044 — Horário Seg-Sex 09h-16h.

7. **Preços atuais no cadastro**: R$ 4 a R$ 4.850. Manter formato brasileiro com vírgula decimal (`R$ 12,00`).

8. **Sistema de descrições narrativas dos produtos**: cada produto tem `description` e `history` gerados a partir de dados estruturados (denominação + estampa + ano + assinaturas + estado + defeitos + sequência). Ver `data/build-scripts` para lógica de geração se precisar recompor.

9. **Sistema de filtros dinâmicos**: as opções dos checkboxes de Denominação/Ano/Estado do catálogo são geradas a partir dos produtos reais, não hard-coded. Reproduzir esse padrão.

10. **O CSV/XLSX é a fonte de verdade**: sempre que o cadastro for atualizado, regenerar o `data.js` (ou API/CMS equivalente) a partir da planilha, não editar produtos à mão.

---

## Suggested Implementation Roadmap

1. **Fase 1 — Estrutura**: Next.js + Tailwind com design tokens mapeados, header/footer/layouts base
2. **Fase 2 — Catálogo estático**: importar produtos como JSON estático (SSG), implementar filtros e paginação client-side
3. **Fase 3 — Páginas institucionais**: Home, Sobre, Autenticidade, Contato, Blog (Markdown/MDX)
4. **Fase 4 — E-commerce**: integrar backend de produtos (Sanity/Strapi), carrinho persistente, checkout com PIX (Pagar.me/MercadoPago)
5. **Fase 5 — Conta**: autenticação, histórico de pedidos, download de certificados
6. **Fase 6 — Fotografia real**: substituir imagens geradas por fotos profissionais das peças
7. **Fase 7 — SEO + Analytics**: sitemap, Open Graph, Google Analytics, Search Console
