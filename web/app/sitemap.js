// =============================================================================
// Bloco 9 (SEO) — sitemap.xml gerado dinamicamente (Next.js App Router)
// =============================================================================
// Convenção nativa do Next.js: este arquivo é servido automaticamente em
// /sitemap.xml. Combina as rotas estáticas do site com as rotas dinâmicas
// reais vindas do banco (produtos ativos e posts do Diário do Curador), para
// que buscadores encontrem cada página de produto/artigo individualmente.
//
// Executa em runtime (dynamic = 'force-dynamic'), assim como as demais
// páginas orientadas a dados deste app — o catálogo muda via painel admin,
// então o sitemap deve refletir o estado atual do banco a cada requisição.
// =============================================================================

import { getVisibleProducts, getAllPosts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br').replace(/\/$/, '');
  const now = new Date();

  const staticRoutes = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/catalogo', changeFrequency: 'daily', priority: 0.9 },
    { path: '/sobre', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/autenticidade', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/diario', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/contato', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/politica-de-privacidade', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/termos-de-uso', changeFrequency: 'yearly', priority: 0.2 },
  ].map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let productRoutes = [];
  let postRoutes = [];

  try {
    const products = await getVisibleProducts();
    productRoutes = products.map((p) => ({
      url: `${siteUrl}/produto/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[sitemap] falha ao carregar produtos:', err);
  }

  try {
    const posts = await getAllPosts();
    postRoutes = posts.map((p) => ({
      url: `${siteUrl}/diario/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    }));
  } catch (err) {
    console.error('[sitemap] falha ao carregar posts:', err);
  }

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
