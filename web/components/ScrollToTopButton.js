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
// Posição fixa do botão (mantida em sincronia com o style abaixo) — usada
// apenas para calcular colisão com conteúdo da página em JS.
const BTN_RIGHT = 16;
const BTN_BOTTOM = 84;
const BTN_SIZE = 44;
const COLLISION_MARGIN = 8; // pequena folga extra ao redor do botão

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  // Correção (Problema 4 — mobile): o botão fixo de "voltar ao topo" cobria
  // o canto do card verde "Confirme sua visita" (.whatsapp-card) quando a
  // página era rolada até essa seção, já que sua posição fixa não tem
  // nenhuma noção do conteúdo por baixo dele. Em vez de mover o botão para
  // sempre (o que abriria espaço vazio no resto da página), detectamos
  // colisão real: a cada scroll, comparamos o retângulo do botão com o
  // retângulo de qualquer .whatsapp-card presente na página e escondemos
  // (fade-out) o botão só enquanto os dois se sobrepõem.
  const [overlapping, setOverlapping] = useState(false);

  useEffect(() => {
    const checkOverlap = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const btnLeft = vw - BTN_RIGHT - BTN_SIZE - COLLISION_MARGIN;
      const btnRight = vw - BTN_RIGHT + COLLISION_MARGIN;
      const btnTop = vh - BTN_BOTTOM - BTN_SIZE - COLLISION_MARGIN;
      const btnBottom = vh - BTN_BOTTOM + COLLISION_MARGIN;

      const cards = document.querySelectorAll('.whatsapp-card');
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        const hit = r.left < btnRight && r.right > btnLeft && r.top < btnBottom && r.bottom > btnTop;
        if (hit) return true;
      }
      return false;
    };

    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
      setOverlapping(checkOverlap());
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shown = visible && !overlapping;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      style={{
        position: 'fixed',
        right: BTN_RIGHT,
        bottom: BTN_BOTTOM,
        zIndex: 9998,
        width: BTN_SIZE,
        height: BTN_SIZE,
        borderRadius: '50%',
        border: '1px solid rgba(122, 31, 43, 0.25)',
        background: 'rgba(58, 20, 32, 0.88)',
        color: '#f4ede1',
        boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: shown ? 'auto' : 'none',
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
