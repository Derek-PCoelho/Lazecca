import { Suspense } from 'react';
import CatalogClient from './CatalogClient';

export const metadata = {
  title: 'Catálogo · Lazecca Numismática',
  description: 'Explore todo o acervo de cédulas e moedas autenticadas da La Zecca. Filtre por denominação, ano, estado de conservação e preço.',
};

// useSearchParams exige um boundary de Suspense (necessário para export estático)
export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogClient />
    </Suspense>
  );
}
