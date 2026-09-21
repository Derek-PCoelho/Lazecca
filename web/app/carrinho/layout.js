// Bloco 9 (SEO) — page.js desta rota é 'use client' e não pode exportar
// `metadata`; um layout.js Server Component ao lado cobre isso sem alterar
// a lógica client existente.
export const metadata = {
  title: 'Carrinho · La Zecca Numismática',
  description: 'Revise as peças selecionadas antes de finalizar sua compra na La Zecca Numismática.',
  robots: { index: false, follow: true },
};

export default function CarrinhoLayout({ children }) {
  return children;
}
