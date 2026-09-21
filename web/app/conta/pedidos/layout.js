// Bloco 9 (SEO) — cobre /conta/pedidos/[id] (page.js é 'use client').
// noindex: conteúdo pessoal/transacional do cliente, sem valor de busca.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function PedidosLayout({ children }) {
  return children;
}
