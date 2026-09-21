// Bloco 9 (SEO) — page.js desta rota é 'use client' e não pode exportar
// `metadata`; um layout.js Server Component ao lado cobre isso sem alterar
// a lógica client existente.
export const metadata = {
  title: 'Fale Conosco · La Zecca Numismática',
  description:
    'Entre em contato com a La Zecca Numismática para dúvidas sobre peças, autenticidade, pedidos ou parcerias.',
};

export default function ContatoLayout({ children }) {
  return children;
}
