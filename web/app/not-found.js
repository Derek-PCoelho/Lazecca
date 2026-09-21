import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';

// Bloco 9 (SEO) — página 404 sinaliza noindex para não competir por
// indexação com conteúdo real do site.
export const metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: false },
};

// Melhoria 8 — Tratamento de produto/rota inexistente.
// Usado tanto para o 404 global quanto disparado por notFound() em /produto/[slug].
export default function NotFound() {
  return (
    <>
      <Header page="home" />
      <div className="container" style={{ padding: '96px 0', textAlign: 'center' }}>
        <Icon name="search" size={48} style={{ margin: '0 auto 24px', opacity: 0.4 }} />
        <h1 className="h1">Produto não encontrado</h1>
        <p className="lede" style={{ margin: '16px auto 32px', maxWidth: 480 }}>
          Confira nosso catálogo completo abaixo — talvez a peça que você procura esteja lá com outro nome ou já
          tenha sido vendida.
        </p>
        <Link href="/catalogo" className="btn btn-primary btn-lg">
          Ver catálogo completo
        </Link>
      </div>
      <Footer />
    </>
  );
}
