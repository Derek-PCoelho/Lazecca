import FavoritosClient from './FavoritosClient';

// SEO — página transacional (lista de favoritos individual do usuário
// autenticado, sem conteúdo próprio para indexar) marcada noindex. Ver nota
// equivalente em app/carrinho/page.js sobre o motivo da extração para um
// componente client separado.
export const metadata = {
  title: 'Favoritos',
  alternates: { canonical: '/favoritos' },
  robots: { index: false, follow: false },
};

export default function FavoritosPage() {
  return <FavoritosClient />;
}
