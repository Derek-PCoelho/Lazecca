// Bloco 9 (SEO) — page.js desta rota é 'use client' e não pode exportar
// `metadata`; um layout.js Server Component ao lado cobre isso sem alterar
// a lógica client existente. noindex: página transacional, sem valor de
// busca e que não deve aparecer nos resultados.
export const metadata = {
  title: 'Finalizar Compra · La Zecca Numismática',
  description: 'Finalize sua compra com segurança na La Zecca Numismática.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }) {
  return children;
}
