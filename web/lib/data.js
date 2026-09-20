// =============================================================================
// La Zecca — Camada de acesso a dados (Fase 8: Prisma / MySQL real)
// =============================================================================
// Este módulo substituiu os JSONs estáticos (web/data/*.json) por consultas
// reais ao banco de dados MySQL (Hostinger), populado via `prisma/seed.js` a
// partir da mesma fonte de verdade (design_files/data/cadastro-v2.xlsx).
//
// IMPORTANTE: todas as funções aqui são ASSÍNCRONAS (fazem I/O de banco) e só
// podem ser chamadas em Server Components ou Route Handlers (nunca dentro de
// componentes 'use client' — para esses, os dados chegam via props vindas de
// um componente servidor pai, ou via chamadas a app/api/**).
//
// `formatPrice`, `getShippingPrice` e as constantes de web/lib/config.js
// continuam síncronas (são funções puras, sem I/O) e podem ser importadas
// livremente em componentes client.
// =============================================================================

import { prisma } from './prisma';

const SHOW_SAMPLES = process.env.NEXT_PUBLIC_SHOW_SAMPLE_PRODUCTS === 'true';

// -----------------------------------------------------------------------------
// Mapeamento DB -> shape usado pelos componentes (idêntico ao antigo JSON
// estático, para minimizar mudanças nas telas React já existentes).
// -----------------------------------------------------------------------------
function mapProduct(p) {
  if (!p) return null;
  const images = (p.images || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.url);
  return {
    id: p.legacyCode,
    dbId: p.id,
    slug: p.slug,
    name: p.name,
    denomination: p.denomination,
    year: p.year,
    country: p.country,
    countryCode: p.countryCode,
    metal: p.metal,
    weight: p.weight,
    diameter: p.diameter,
    state: p.state,
    stateShort: p.stateShort,
    stateFull: p.stateFull,
    stateLabel: p.stateLabel,
    category: p.category?.slug || null,
    categoryName: p.category?.name || null,
    price: Number(p.price),
    priceOld: p.priceOld != null ? Number(p.priceOld) : null,
    image: images[0] || null,
    images,
    seals: Array.isArray(p.seals) ? p.seals : [],
    rarity: p.rarity,
    padrao: p.padrao,
    periodo: p.periodo,
    figura: p.figura,
    estampa: p.estampa,
    serie: p.serie,
    assinaturas: p.assinaturas,
    variedade: p.variedade,
    defeitos: p.defeitos,
    quantidade: p.quantidade,
    isSequencia: p.isSequencia,
    observacoes: p.observacoes,
    referenciaCatalogo: p.catalogReference,
    description: p.description,
    history: p.history,
    certificate: p.certificate,
    shipping: p.shipping,
    legacyId: null,
    isSample: p.isSample,
    stock: p.stock,
    weightGrams: p.weightGrams,
  };
}

function mapPost(post) {
  if (!post) return null;
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.displayDate,
    readTime: post.readTime,
    category: post.category,
    cover: post.coverImage,
    author: post.author,
    contentHtml: post.contentHtml,
  };
}

function mapReview(r) {
  return {
    author: r.authorName,
    city: r.authorCity,
    rating: r.rating,
    date: r.displayDate,
    title: r.title,
    text: r.comment,
  };
}

// -----------------------------------------------------------------------------
// Produtos
// -----------------------------------------------------------------------------

export async function getVisibleProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true, ...(SHOW_SAMPLES ? {} : { isSample: false }) },
    include: { images: true, category: true },
    orderBy: { createdAt: 'asc' },
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { legacyCode: slug }] },
    include: { images: true, category: true },
  });
  return mapProduct(product);
}

export async function getRelatedProducts(product, count = 4) {
  const visible = await getVisibleProducts();
  let related = visible.filter((p) => p.category === product.category && p.id !== product.id);
  if (related.length < count) {
    const rest = visible.filter((p) => p.id !== product.id && !related.find((r) => r.id === p.id));
    related = related.concat(rest.slice(0, count - related.length));
  }
  return related.slice(0, count);
}

// Melhoria 4 — Filtro de preço dinâmico: min/max calculados a partir dos produtos reais.
export function getPriceRange(products = []) {
  if (!products.length) return { min: 0, max: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min, max };
}

// -----------------------------------------------------------------------------
// Categorias
// -----------------------------------------------------------------------------

export async function getCategories() {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: { where: { isActive: true, ...(SHOW_SAMPLES ? {} : { isSample: false }) } } },
      },
    },
  });
  return cats.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, count: c._count.products }));
}

export async function getFooterCategoryLinks() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug, name: c.name }));
}

// -----------------------------------------------------------------------------
// Filtros do catálogo (denominação / ano / estado) — calculados dinamicamente
// a partir dos produtos reais, em vez do JSON estático `filtros.json`.
// -----------------------------------------------------------------------------

function countBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const val = item[key];
    if (val === null || val === undefined || val === '') continue;
    map.set(val, (map.get(val) || 0) + 1);
  }
  return map;
}

export async function getFiltros() {
  const products = await getVisibleProducts();
  const denomMap = countBy(products, 'denomination');
  const yearMap = countBy(products, 'year');
  const stateMap = countBy(products, 'state');
  const padraoMap = countBy(products, 'padrao');

  return {
    denominacoes: Array.from(denomMap, ([nome, count]) => ({ nome, count })),
    anos: Array.from(yearMap, ([ano, count]) => ({ ano, count })).sort((a, b) => a.ano - b.ano),
    estados: Array.from(stateMap, ([estado, count]) => ({ estado, count })),
    padroes: Array.from(padraoMap, ([nome, count]) => ({ nome, count })),
  };
}

// -----------------------------------------------------------------------------
// Blog / Diário do Curador
// -----------------------------------------------------------------------------

export async function getAllPosts() {
  const posts = await prisma.post.findMany({ orderBy: { sortOrder: 'asc' } });
  return posts.map(mapPost);
}

export async function getPostBySlug(slug) {
  const post = await prisma.post.findUnique({ where: { slug } });
  return mapPost(post);
}

export async function getRelatedPosts(post, count = 3) {
  const all = await getAllPosts();
  return all.filter((p) => p.slug !== post.slug).slice(0, count);
}

// -----------------------------------------------------------------------------
// Reviews (usadas na home / página de produto, se aplicável)
// -----------------------------------------------------------------------------

export async function getReviews() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
  return reviews.map(mapReview);
}

// -----------------------------------------------------------------------------
// Utilitário puro (sem I/O) — pode ser importado em componentes client
// -----------------------------------------------------------------------------
export function formatPrice(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
