'use client';

import { useEffect, useState } from 'react';

// =============================================================================
// Botão flutuante "voltar ao topo"
// =============================================================================
// No modo mobile, a barra de filtros e o menu hambúrguer (Header.js) somem
// depois de um tempo rolando a página para baixo, dificultando o retorno ao
// topo em páginas longas (catálogo, política de privacidade, etc.). Este
// botão discreto aparece após um pequeno scroll e leva o usuário de volta ao
// topo com um clique, tanto no mobile quanto no desktop.
// =============================================================================

const SHOW_AFTER_PX = 480;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 84,
        zIndex: 9998,
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid rgba(122, 31, 43, 0.25)',
        background: 'rgba(58, 20, 32, 0.88)',
        color: '#f4ede1',
        boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
