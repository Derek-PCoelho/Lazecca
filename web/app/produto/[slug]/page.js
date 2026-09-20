import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, formatPrice } from '@/lib/data';
import ProductClient from './ProductClient';

export const dynamic = 'force-dynamic';

// Rota dinâmica /produto/[slug]. Fase 8: dados vêm do banco real (Prisma) em
// vez de generateStaticParams + export estático — a página agora é renderizada
// sob demanda pelo servidor Node.js (output: 'standalone').
export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Produto não encontrado · Lazecca Numismática' };
  }
  const description = product.description?.slice(0, 155) || `${product.name} — peça autenticada do acervo La Zecca.`;
  return {
    title: `${product.name} · Lazecca Numismática`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [`/${product.image}`] : [],
    },
  };
}

// Melhoria 8 — Tratamento de produto inexistente: qualquer slug sem produto
// correspondente cai em not-found.js.
export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }
  const related = await getRelatedProducts(product, 4);
  return <ProductClient product={product} related={related} />;
}
