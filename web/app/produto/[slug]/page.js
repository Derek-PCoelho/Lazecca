import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, formatPrice } from '@/lib/data';
import ProductClient from './ProductClient';

export const dynamic = 'force-dynamic';

// Rota dinâmica /produto/[slug]. Fase 8: dados vêm do banco real (Prisma) em
// vez de generateStaticParams + export estático — a página agora é renderizada
// sob demanda pelo servidor Node.js (output: 'standalone').
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Produto não encontrado' };
  }
  const description = product.description?.slice(0, 155) || `${product.name} — peça autenticada do acervo La Zecca.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      images: product.image ? [`/${product.image}`] : [],
    },
  };
}

// Bloco 9 (SEO) — Schema.org (JSON-LD) Product, para rich results de preço,
// disponibilidade e marca nas buscas do Google. `availability` reflete o
// estoque real: peças esgotadas (stock <= 0) permanecem indexadas
// (ver decisão documentada em lib/data.js) mas sinalizam OutOfStock.
function ProductJsonLd({ product }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — peça autenticada do acervo La Zecca.`,
    image: product.image ? [`${siteUrl}/${product.image}`] : undefined,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'La Zecca Numismática' },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/produto/${product.slug}`,
      priceCurrency: 'BRL',
      price: product.price,
      availability:
        product.stock != null && product.stock <= 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
    },
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Melhoria 8 — Tratamento de produto inexistente: qualquer slug sem produto
// correspondente cai em not-found.js.
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }
  const related = await getRelatedProducts(product, 4);
  return (
    <>
      <ProductJsonLd product={product} />
      <ProductClient product={product} related={related} />
    </>
  );
}
