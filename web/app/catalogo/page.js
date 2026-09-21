import { Suspense } from 'react';
import { getVisibleProducts, getCategories, getFiltros, getPriceRange } from '@/lib/data';
import CatalogClient from './CatalogClient';

export const metadata = {
  title: 'Catálogo de Cédulas e Moedas Antigas',
  description: 'Explore o acervo completo de cédulas e moedas antigas autenticadas da La Zecca Numismática, em Fortaleza/CE. Filtre por denominação, ano, estado de conservação e preço para colecionismo.',
  alternates: { canonical: '/catalogo' },
  openGraph: {
    title: 'Catálogo de Cédulas e Moedas Antigas · La Zecca Numismática',
    description: 'Explore o acervo completo de cédulas e moedas antigas autenticadas da La Zecca Numismática, em Fortaleza/CE.',
    url: '/catalogo',
  },
};

export const dynamic = 'force-dynamic';

// Server Component: busca produtos/categorias/filtros reais via Prisma e
// repassa como props (useSearchParams no client exige boundary de Suspense).
export default async function CatalogPage() {
  const [products, categories, filtros] = await Promise.all([
    getVisibleProducts(),
    getCategories(),
    getFiltros(),
  ]);
  const priceRange = getPriceRange(products);

  return (
    <Suspense fallback={null}>
      <CatalogClient products={products} categories={categories} filtros={filtros} priceRange={priceRange} />
    </Suspense>
  );
}
