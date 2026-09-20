import { Suspense } from 'react';
import { getVisibleProducts, getCategories, getFiltros, getPriceRange } from '@/lib/data';
import CatalogClient from './CatalogClient';

export const metadata = {
  title: 'Catálogo · Lazecca Numismática',
  description: 'Explore todo o acervo de cédulas e moedas autenticadas da La Zecca. Filtre por denominação, ano, estado de conservação e preço.',
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
