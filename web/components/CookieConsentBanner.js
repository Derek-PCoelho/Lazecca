'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// =============================================================================
// Bloco 7 — Banner de consentimento de cookies (LGPD)
// =============================================================================
// O site hoje usa apenas 1 cookie: o cookie de sessão httpOnly (lz_session),
// estritamente necessário para manter o usuário logado — não é um cookie de
// rastreamento/analytics/publicidade, então tecnicamente nem exigiria opção
// de recusa (cookies estritamente necessários são dispensados de
// consentimento pela própria LGPD/ePrivacy). Mesmo assim, exibimos este
// banner por transparência e boa prática de mercado, informando o visitante
// e linkando a Política de Privacidade — sem bloquear nenhuma funcionalidade
// do site caso o aviso seja apenas fechado sem clicar em "Aceitar" (não há
// cookie não-essencial para desativar hoje).
//
// A escolha do usuário fica salva em localStorage (chave `lz_cookie_consent`)
// para não reexibir o banner a cada visita.
// =============================================================================

const STORAGE_KEY = 'lz_cookie_consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage indisponível (modo privado restrito) — não bloqueia o site,
      // apenas deixa de lembrar a escolha entre visitas.
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      // ignora falha de storage
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 640,
        margin: '0 auto',
        background: 'var(--burgundy-900, #3a1420)',
        color: 'var(--parchment, #f4ede1)',
        borderRadius: 12,
        padding: '18px 20px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, flex: '1 1 320px' }}>
        Usamos apenas um cookie essencial para manter você conectado à sua conta.
        Não usamos cookies de rastreamento ou publicidade. Saiba mais na nossa{' '}
        <Link href="/politica-de-privacidade" style={{ color: 'var(--gold-400, #d9b56a)', textDecoration: 'underline' }}>
          Política de Privacidade
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={accept}
        className="btn btn-gold"
        style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        Entendi
      </button>
    </div>
  );
}
