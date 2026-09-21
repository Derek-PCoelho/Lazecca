import ContactClient from './ContactClient';

// SEO — extraído para um componente client separado (ContactClient) porque a
// página original usava 'use client' (estado do formulário) diretamente no
// arquivo page.js, o que impede exportar `metadata` (só Server Components
// podem exportar metadata). Este wrapper server-side permite ter tanto o
// formulário interativo quanto title/description/canonical próprios da
// página, em vez de herdar os valores genéricos do layout raiz.
export const metadata = {
  title: 'Contato',
  description: 'Fale com a La Zecca Numismática: dúvidas sobre uma peça, avaliação de coleção de cédulas e moedas antigas, ou consignação para venda. Loja em Fortaleza/CE.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Contato · La Zecca Numismática',
    description: 'Fale com a La Zecca Numismática: dúvidas sobre uma peça, avaliação de coleção, ou consignação para venda.',
    url: '/contato',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
