import { notFound } from 'next/navigation';
import { getVisibleProducts, getProductBySlug, getRelatedProducts, formatPrice } from '@/lib/data';
import ProductClient from './ProductClient';

// Melhoria 14: rota dinâmica /produto/[slug] (antes product.html?id=)
// Melhoria 15: meta tags dinâmicas geradas em build time via generateStaticParams
//   (export estático — sem generateMetadata em tempo de requisição, ver next.config.mjs)
export function generateStaticParams() {
  return getVisibleProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const product = getProductBySlug(params.slug);
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

// Melhoria 8 — Tratamento de produto inexistente: elimina o fallback `params.get('id') || 'p001'`
// do protótipo. Qualquer slug sem produto correspondente cai em not-found.js, que redireciona
// para /catalogo com a mensagem "Produto não encontrado. Confira nosso catálogo completo abaixo".
export default function ProductPage({ params }) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }
  const related = getRelatedProducts(product, 4);
  return <ProductClient product={product} related={related} />;
}
