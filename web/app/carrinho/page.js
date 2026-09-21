import CarrinhoClient from './CarrinhoClient';

// SEO — página transacional (carrinho de compras individual do visitante,
// sem conteúdo próprio para indexar) marcada noindex. Extraída para um
// componente client separado para permitir exportar `metadata` a partir de
// um Server Component (page.js), o que não seria possível diretamente em
// um arquivo com 'use client'.
export const metadata = {
  title: 'Carrinho',
  alternates: { canonical: '/carrinho' },
  robots: { index: false, follow: false },
};

export default function CarrinhoPage() {
  return <CarrinhoClient />;
}
