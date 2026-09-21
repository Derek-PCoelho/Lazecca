// Bloco 9 (SEO) — page.js desta rota é 'use client' e não pode exportar
// `metadata`; um layout.js Server Component ao lado cobre isso sem alterar
// a lógica client existente. noindex: conteúdo é pessoal/por sessão do
// visitante, sem valor de indexação pública.
export const metadata = {
  title: 'Meus Favoritos · La Zecca Numismática',
  description: 'Peças que você salvou como favoritas no acervo da La Zecca Numismática.',
  robots: { index: false, follow: true },
};

export default function FavoritosLayout({ children }) {
  return children;
}
