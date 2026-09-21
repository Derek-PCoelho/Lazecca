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
  // SEO — cada produto ganha um <title> único e descritivo (em vez de repetir
  // apenas o nome curto da peça), incluindo o código de referência, o tipo da
  // peça (cédula/moeda) e as palavras-chave de negócio mais relevantes, ex.:
  // "1 Cruzeiro · 1944 (C0001) | Cédula Antiga Autenticada | La Zecca Numismática".
  const pieceType = product.metal === 'Papel-moeda' ? 'Cédula Antiga' : 'Moeda Antiga';
  const title = `${product.name} (${product.id}) | ${pieceType} Autenticada`;
  const description =
    product.description?.slice(0, 150) ||
    `${product.name} — ${pieceType.toLowerCase()} de colecionador autenticada pela La Zecca Numismática, em Fortaleza/CE. Estado de conservação: ${product.stateLabel || product.state}.`;
  return {
    title,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${title} · La Zecca Numismática`,
      description,
      url: `/produto/${product.slug}`,
      images: product.image ? [{ url: `/${product.image}`, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · La Zecca Numismática`,
      description,
      images: product.image ? [`/${product.image}`] : undefined,
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
      seller: { '@type': 'Organization', name: 'La Zecca Numismática', url: siteUrl },
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
