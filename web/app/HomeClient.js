'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import useReveal from '@/lib/useReveal';

// Recriado literalmente de design_files/index.html
// Fase 8: dados (categories) agora vêm via props, buscados no servidor
// (Prisma) por app/page.js — este componente cuida só da interatividade
// (animações de reveal ao rolar a página).
export default function HomeClient({ categories }) {
  useReveal();

  return (
    <>
      <Header page="home" />

      {/* ================= CURADOR (minimalista) ================= */}
      <section className="bg-burgundy">
        <div className="container">
          <div className="curator-minimal">
            <div className="portrait fade-in">
              <Image src="/assets/dr-sergio-portrait.png" alt="Dr. Sergio Costa" width={380} height={507} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <span className="eyebrow fade-in-up" style={{ color: 'var(--gold-600)' }}>
                Quem cuida do seu acervo
              </span>
              <h2 className="h1 fade-in-up-2" style={{ color: 'var(--gold-500)', marginTop: 12 }}>
                Dr. Sergio Costa
              </h2>
              <blockquote className="fade-in-up-3">
                &quot;Uma moeda não é apenas metal. É um pequeno teatro, onde príncipes, guerras e mercados se
                representam.&quot;
              </blockquote>
              <p
                className="fade-in-up-3"
                style={{ color: 'var(--parchment)', fontSize: 17, lineHeight: 1.7, marginBottom: 8, maxWidth: 520 }}
              >
                Numismata há 27 anos, doutor em História Econômica pela USP. Cada peça em nosso catálogo passa
                pelas suas mãos antes de chegar às suas.
              </p>
              <Link href="/sobre" className="btn btn-gold fade-in-up-3" style={{ marginTop: 28 }}>
                Conheça nossa história
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow reveal">Numismática de curadoria · desde 1998</span>
              <h1 className="reveal">
                Cada moeda é <em>uma história</em> que o tempo esqueceu de contar.
              </h1>
              <p className="lede reveal">
                Peças autenticadas e apresentadas pelo Dr. Sergio Costa. Da colônia ao século XX, escolhidas com
                rigor para o seu acervo.
              </p>
              <div className="hero-cta reveal">
                <Link href="/catalogo" className="btn btn-primary btn-lg">
                  Explorar o Acervo
                </Link>
                <Link href="/sobre" className="btn btn-ghost btn-lg">
                  Sobre o Dr. Sergio
                </Link>
              </div>
            </div>

            <div className="hero-visual reveal">
              <span className="hero-featured-tag">Peça em Destaque</span>
              <Image
                src="/assets/hero-featured-coin.png"
                alt="20.000 Réis Ouro — Império, 1889"
                width={520}
                height={693}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIAS ================= */}
      <section className="bg-paper-soft">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-title">
              <span className="eyebrow">O Acervo</span>
              <h2 className="h2">Explore por categoria</h2>
            </div>
            <Link href="/catalogo" className="link-more">
              Ver tudo <Icon name="chevron-right" size={14} />
            </Link>
          </div>
          <div className="cat-grid-4 reveal-stagger">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.slug} href={`/catalogo?cat=${cat.slug}`} className="cat-chip">
                <div className="cat-icon">
                  <Icon name={cat.icon} size={26} />
                </div>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">{cat.count} peças</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="cta-simple">
        <div className="container">
          <div className="reveal">
            <span className="eyebrow eyebrow-burgundy">Comece sua coleção</span>
            <h2>
              Uma peça de cada vez, <em>um século de cada vez.</em>
            </h2>
            <p>
              Explore o catálogo completo, filtre pelo que você procura e conte com nosso atendimento para
              escolher com calma.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/catalogo" className="btn btn-primary btn-lg">
                Ver todas as peças
              </Link>
              <Link href="/contato" className="btn btn-outline btn-lg">
                Falar com o Dr. Sergio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
