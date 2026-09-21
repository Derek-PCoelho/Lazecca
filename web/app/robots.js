// =============================================================================
// Bloco 9 (SEO) — robots.txt gerado dinamicamente (Next.js App Router)
// =============================================================================
// Convenção nativa do Next.js: este arquivo é servido automaticamente em
// /robots.txt (sem precisar de um arquivo estático em public/).
// Bloqueia rastreamento de áreas administrativas e de API (não fazem sentido
// para SEO e podem vazar estrutura interna do sistema), liberando o restante
// do site para indexação normal, e referencia o sitemap.xml (também gerado
// dinamicamente por app/sitemap.js).
// =============================================================================

export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/conta', '/checkout', '/carrinho'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
