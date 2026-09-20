import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// =============================================================================
// Página placeholder — "Política de Privacidade"
//
// O protótipo original (design_files/*.html) não inclui uma página de
// Política de Privacidade; o link já existia no rodapé (Footer/components.jsx)
// apontando para "#". Como parte do grupo de melhorias de polimento do
// megaprompt (Seção 7), criamos uma rota real "/politica-de-privacidade"
// para que o link do Footer deixe de ser um link morto, mas o CONTEÚDO
// jurídico completo está fora do escopo orçado nesta fase — este é
// intencionalmente um placeholder "Em construção", a ser substituído pelo
// texto jurídico definitivo fornecido pelo cliente/jurídico em fase futura.
// =============================================================================

export const metadata = {
  title: 'Política de Privacidade | Lazecca Numismática',
  description: 'Política de Privacidade da Lazecca Numismática.',
};

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <Header />
      <div className="container" style={{ padding: '64px 0 96px', maxWidth: 720 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--burgundy-900)', marginTop: 8 }}>
          Política de Privacidade
        </h1>
        <p style={{ color: 'var(--ink-500)', marginTop: 16, lineHeight: 1.7 }}>
          Esta página está em construção. Em breve, publicaremos aqui a
          Política de Privacidade completa da Lazecca Numismática, descrevendo
          como coletamos, usamos e protegemos os dados dos nossos clientes e
          visitantes.
        </p>
        <p style={{ color: 'var(--ink-500)', marginTop: 16, lineHeight: 1.7 }}>
          Em caso de dúvidas sobre privacidade e proteção de dados, entre em
          contato pelos canais informados na nossa{' '}
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
