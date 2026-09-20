'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { POSTS } from '@/lib/data';

// Recriado literalmente de design_files/blog.html
// Nota (seção 5 do megaprompt): o filtro por categoria JÁ EXISTIA no protótipo — este
// arquivo preserva a mesma lógica (array fixo de categorias + useState filtrando por
// post.category). O que de fato faltava era paginação (Melhoria 12), adicionada abaixo.
const cats = ['Todos', 'Guias', 'História', 'Estética', 'Curiosidades'];
const POSTS_PER_PAGE = 6;

export default function BlogClient() {
  const featured = POSTS[0];
  const rest = POSTS.slice(1);

  const [cat, setCat] = useState('Todos');
  const [page, setPage] = useState(1);

  const filtered = cat === 'Todos' ? rest : rest.filter((p) => p.category === cat);
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  const changeCat = (c) => {
    setCat(c);
    setPage(1);
  };

  return (
    <>
      <Header page="blog" />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Diário Numismático</span>
          </div>
          <h1 className="h1">Diário Numismático</h1>
          <p className="lede">
            Guias práticos, histórias curiosas e dicas para quem está começando ou já tem uma coleção. Sem termos
            complicados, só conhecimento acessível.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Featured */}
        <Link href={`/diario/${featured.slug}`} className="blog-featured">
          <div className="blog-featured-cover">
            <Image src={`/${featured.cover}`} alt={featured.title} width={600} height={450} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="blog-featured-copy">
            <span className="eyebrow">Destaque · {featured.category}</span>
            <h2>{featured.title}</h2>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--ink-700)', marginBottom: 24 }}>
              {featured.excerpt}
            </p>
            <div style={{ fontSize: 12, color: 'var(--ink-400)', letterSpacing: '0.08em', marginBottom: 24 }}>
              Por <b style={{ color: 'var(--ink-700)' }}>{featured.author}</b> · {featured.date} · {featured.readTime} de leitura
            </div>
            <span className="btn btn-primary">
              Ler artigo <Icon name="chevron-right" size={14} />
            </span>
          </div>
        </Link>

        <div className="blog-filters">
          {cats.map((c) => (
            <button key={c} className={`blog-filter ${c === cat ? 'active' : ''}`} onClick={() => changeCat(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="blog-list">
          {pageItems.map((post) => (
            <Link key={post.slug} href={`/diario/${post.slug}`} className="blog-post">
              <div className="cover">
                <Image src={`/${post.cover}`} alt={post.title} width={500} height={312} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="cat">{post.category}</div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="meta">
                <span>{post.date}</span>
                <span className="sep">·</span>
                <span>{post.readTime} de leitura</span>
                <span className="sep">·</span>
                <span>{post.author}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Melhoria 12 — Paginação sobre o filtro já existente */}
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Paginação do blog">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Página anterior">
              <Icon name="chevron-left" size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === safePage ? 'active' : ''} onClick={() => setPage(n)} aria-current={n === safePage ? 'page' : undefined}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Próxima página">
              <Icon name="chevron-right" size={16} />
            </button>
          </nav>
        )}

        {/* Newsletter inline */}
        <section style={{ marginTop: 80, padding: '48px 0' }}>
          <div style={{ background: 'var(--cream)', padding: '48px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <span className="eyebrow">Assine nossa newsletter</span>
            <h2 className="h2" style={{ marginTop: 12, marginBottom: 12 }}>Novidades toda semana no seu e-mail</h2>
            <p style={{ color: 'var(--ink-700)', maxWidth: 520, margin: '0 auto 24px' }}>
              Novos artigos, peças recém-chegadas e dicas do Dr. Sergio. Curto, sem spam — só conteúdo bom.
            </p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap' }}>
              <input placeholder="seu@email.com.br" style={{ flex: 1, minWidth: 200, padding: '14px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', background: 'var(--paper-soft)' }} />
              <button className="btn btn-primary btn-lg">Assinar</button>
            </form>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
