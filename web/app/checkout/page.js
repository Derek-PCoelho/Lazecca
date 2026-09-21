import CheckoutClient from './CheckoutClient';

// SEO — página transacional (checkout individual do visitante, sem conteúdo
// próprio para indexar) marcada noindex. Ver nota equivalente em
// app/carrinho/page.js sobre o motivo da extração para um componente client
// separado.
export const metadata = {
  title: 'Finalizar Compra',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
