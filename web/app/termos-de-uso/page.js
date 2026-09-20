import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// =============================================================================
// Página placeholder — "Termos de Uso"
//
// Mesma justificativa da página de Política de Privacidade (ver comentário em
// app/politica-de-privacidade/page.js): o protótipo original não tinha uma
// rota real para os Termos de Uso (link "#" no Footer e no formulário de
// cadastro da página de Conta). Criamos a rota "/termos-de-uso" para eliminar
// o link morto, com conteúdo placeholder "Em construção" — o texto jurídico
// definitivo é responsabilidade do cliente/jurídico e está fora do escopo
// orçado nesta fase.
// =============================================================================

export const metadata = {
  title: 'Termos de Uso | Lazecca Numismática',
  description: 'Termos de Uso da Lazecca Numismática.',
};

export default function TermosDeUsoPage() {
  return (
    <>
      <Header />
      <div className="container" style={{ padding: '64px 0 96px', maxWidth: 720 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--burgundy-900)', marginTop: 8 }}>
          Termos de Uso
        </h1>
        <p style={{ color: 'var(--ink-500)', marginTop: 16, lineHeight: 1.7 }}>
          Esta página está em construção. Em breve, publicaremos aqui os
          Termos de Uso completos que regem a utilização do site e a compra
          de peças na Lazecca Numismática.
        </p>
        <p style={{ color: 'var(--ink-500)', marginTop: 16, lineHeight: 1.7 }}>
          Em caso de dúvidas sobre nossos termos, entre em contato pelos
          canais informados na nossa{' '}
          <Link href="/contato" style={{ color: 'var(--burgundy-700)' }}>página de contato</Link>.
        </p>
        <div style={{ marginTop: 32 }}>
          <Link href="/" className="btn btn-outline">Voltar ao início</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
