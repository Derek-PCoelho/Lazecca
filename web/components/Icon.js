// La Zecca — Sistema de ícones (recriado literalmente de design_files/js/components.jsx)
// Melhoria 16: aria-hidden="true" por padrão (ícones são majoritariamente decorativos dentro
// de botões/links que já têm seu próprio texto ou aria-label); quando o ícone É o único
// conteúdo semântico de um controle, o chamador deve passar aria-label explícito, que
// sobrescreve o aria-hidden automaticamente.
export default function Icon({ name, size = 20, ariaLabel, ...props }) {
  const s = size;
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const a11y = ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : { 'aria-hidden': 'true', focusable: 'false' };
  const common = { width: s, height: s, viewBox: '0 0 24 24', ...a11y, ...props };

  switch (name) {
    case 'search':
      return (
        <svg {...common} {...stroke}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common} {...stroke}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 20s-7-4.5-9-9.5C1.5 6 5 3 8 4.5c2 1 3 3 4 4 1-1 2-3 4-4 3-1.5 6.5 1.5 5 6-2 5-9 9.5-9 9.5z" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...common} {...stroke}>
          <path d="M4 5h2l2.5 11.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5L21 8H7" />
          <circle cx="10" cy="21" r="1.5" />
          <circle cx="18" cy="21" r="1.5" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common} {...stroke}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case 'coin':
      return (
        <svg {...common} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
        </svg>
      );
    case 'bill':
      return (
        <svg {...common} {...stroke}>
          <rect x="2" y="6" width="20" height="12" rx="1.5" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 9h.5M17.5 9h.5M6 15h.5M17.5 15h.5" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 3l2.5 5.5 6 .8-4.5 4 1.2 6L12 16.5 6.8 19.3 8 13.3 3.5 9.3l6-.8L12 3z" />
        </svg>
      );
    case 'star-filled':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 3l2.5 5.5 6 .8-4.5 4 1.2 6L12 16.5 6.8 19.3 8 13.3 3.5 9.3l6-.8L12 3z" />
        </svg>
      );
    case 'kit':
      return (
        <svg {...common} {...stroke}>
          <rect x="3" y="6" width="18" height="14" rx="1.5" />
          <path d="M8 6V4h8v2M3 12h18" />
        </svg>
      );
    case 'lens':
      return (
        <svg {...common} {...stroke}>
          <circle cx="10" cy="10" r="6" />
          <path d="M14.5 14.5L20 20" />
        </svg>
      );
    case 'gem':
      return (
        <svg {...common} {...stroke}>
          <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
          <path d="M3 9h18M9 3l3 6 3-6M9 9l3 12 3-12" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'truck':
      return (
        <svg {...common} {...stroke}>
          <rect x="2" y="7" width="12" height="10" rx="1" />
          <path d="M14 10h4l3 3v4h-7" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="17" cy="18" r="1.8" />
        </svg>
      );
    case 'award':
      return (
        <svg {...common} {...stroke}>
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14l-2 7 5.5-3 5.5 3-2-7" />
          <path d="M12 6l1 2 2 .3-1.5 1.4.4 2.1L12 10.8l-1.9 1 .4-2.1L9 8.3 11 8l1-2z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...common} {...stroke}>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common} {...stroke}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...common} {...stroke}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...common} {...stroke}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common} {...stroke}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'minus':
      return (
        <svg {...common} {...stroke}>
          <path d="M5 12h14" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} {...stroke}>
          <path d="M4 12l5 5 11-11" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common} {...stroke}>
          <path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common} {...stroke}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 22s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'zoom-in':
      return (
        <svg {...common} {...stroke}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
        </svg>
      );
    case 'quote':
      return (
        <svg {...common} fill="currentColor">
          <path d="M6 4c-2 2-3 5-3 9v7h7v-9H6V9c0-2 .5-3 2-4L6 4zm10 0c-2 2-3 5-3 9v7h7v-9h-4V9c0-2 .5-3 2-4l-2-1z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zM19 14l1 2.5 2.5 1L20 18.5 19 21l-1-2.5L15.5 17.5 18 16.5 19 14z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...common} fill="currentColor">
          <path d="M13 22v-8h3l1-4h-4V7.5c0-1 .3-2 2-2h2V2h-3c-3 0-5 2-5 5v3H6v4h3v8h4z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common} {...stroke}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1 1 20 12c0 4.4-3.6 8-8 8zm4.5-6c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.2-.5s0-.4-.1-.5c-.1-.1-.6-1.5-.9-2-.2-.5-.5-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9 1-.9 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.8 4.3 2.9 1.1 2.9.7 3.4.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
        </svg>
      );
    case 'pix':
      return (
        <svg {...common} {...stroke}>
          <path d="M12 2l4 4-4 4-4-4 4-4z" />
          <path d="M6 8l-4 4 4 4M18 8l4 4-4 4M12 14l4 4-4 4-4-4 4-4z" />
        </svg>
      );
    case 'sliders':
      return (
        <svg {...common} {...stroke}>
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h14M18 18h2" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="10" cy="12" r="2" />
          <circle cx="16" cy="18" r="2" />
        </svg>
      );
    default:
      return null;
  }
}
