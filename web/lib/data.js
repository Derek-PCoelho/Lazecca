// La Zecca — Camada de acesso a dados
// Fonte de verdade: web/data/products.json, gerado a partir de design_files/data/cadastro-v2.xlsx
// (135 cédulas reais) + 4 itens de demonstração isSample (moedas/acessório sem cadastro real —
// aba "Moedas" da planilha está vazia, ver seção 2 do megaprompt e data-quality-log.md).

import productsRaw from '@/data/products.json';
import categoriesRaw from '@/data/categories.json';
import filtrosRaw from '@/data/filtros.json';
import postsRaw from '@/data/posts.json';
import reviewsRaw from '@/data/reviews.json';
import blogContentsRaw from '@/data/blog-contents.json';

export const ALL_PRODUCTS = productsRaw;
export const CATEGORIES = categoriesRaw;
export const FILTROS = filtrosRaw;
export const POSTS = postsRaw;
export const REVIEWS = reviewsRaw;
export const BLOG_CONTENTS = blogContentsRaw;

// Produtos visíveis em produção: itens isSample (moedas/acessório sem cadastro real
// confirmado na planilha) ficam ocultos do catálogo público até cadastro formal —
// decisão da seção 2 do megaprompt. Controlável via env var para reativar em preview.
const SHOW_SAMPLES = process.env.NEXT_PUBLIC_SHOW_SAMPLE_PRODUCTS === 'true';

export function getVisibleProducts() {
  return SHOW_SAMPLES ? ALL_PRODUCTS : ALL_PRODUCTS.filter((p) => !p.isSample);
}

export function getProductBySlug(slug) {
  return ALL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

export function getRelatedProducts(product, count = 4) {
  const visible = getVisibleProducts();
  let related = visible.filter((p) => p.category === product.category && p.id !== product.id);
  if (related.length < count) {
    const rest = visible.filter((p) => p.id !== product.id && !related.find((r) => r.id === p.id));
    related = related.concat(rest.slice(0, count - related.length));
  }
  return related.slice(0, count);
}

export function getPostBySlug(slug) {
  return POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(post, count = 3) {
  return POSTS.filter((p) => p.slug !== post.slug).slice(0, count);
}

export function formatPrice(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Melhoria 4 — Filtro de preço dinâmico: min/max calculados a partir dos produtos reais
// carregados, em vez do texto fixo "De R$ 4 a R$ 4.850" do protótipo.
export function getPriceRange(products = getVisibleProducts()) {
  if (!products.length) return { min: 0, max: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min, max };
}

// Reconciliação dos links de categoria do footer com LZ_DATA.categories real
// (Melhoria 16-18 grupo de polimento). Categorias reais existentes hoje: cedulas-br,
// moedas-br, moedas-int, acessorios. "comemorativas" e "cedulas-int" não existem no
// acervo real e foram removidas da navegação do footer.
export function getFooterCategoryLinks() {
  return CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }));
}
