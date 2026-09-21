'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { cartCount, CART_CHANGED_EVENT } from '@/lib/cart';
import { CONTACT } from '@/lib/config';

// Recriado literalmente de design_files/js/components.jsx — Header
// page prop identifica o item ativo da nav-primary (mesmos 6 links do protótipo)
//
// Melhoria (mobile): a nav horizontal (.nav-primary) é ótima em telas largas,
// mas em telas estreitas (<=900px) ela quebrava em 2-3 linhas dentro do
// header, inflando a altura do cabeçalho. Em vez de alterar o layout desktop,
// adicionamos um botão hambúrguer + drawer lateral que só existem/aparecem
// em mobile (ver @media (max-width: 900px) em globals.css); em desktop o
// botão fica com display:none e a nav horizontal original permanece intocada.
export default function Header({ page = 'home' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    const update = () => {
      cartCount().then((c) => {
        if (mounted) setCount(c);
      });
    };
    update();
    window.addEventListener(CART_CHANGED_EVENT, update);
    return () => {
      mounted = false;
      window.removeEventListener(CART_CHANGED_EVENT, update);
    };
  }, []);

  // Fecha o drawer mobile automaticamente ao navegar para outra rota
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Trava o scroll do body enquanto o drawer mobile está aberto + permite
  // fechar com a tecla Esc (acessibilidade)
  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e) => {
        if (e.key === 'Escape') setMenuOpen(false);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo');
    setMenuOpen(false);
  };

  const nav = [
    { key: 'home', label: 'Início', href: '/' },
    { key: 'catalog', label: 'Catálogo', href: '/catalogo' },
    { key: 'blog', label: 'Diário', href: '/diario' },
    { key: 'about', label: 'Sobre', href: '/sobre' },
    { key: 'auth', label: 'Autenticidade', href: '/autenticidade' },
    { key: 'como-chegar', label: 'Como Chegar', href: '/como-chegar' },
    { key: 'contact', label: 'Contato', href: '/contato' },
  ];

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container header-top-inner">
          <span className="header-top-tagline">Curadoria numismática · desde 1998</span>
          <span className="header-top-links">
            <Link href="/autenticidade" className="header-top-auth">Autenticidade garantida</Link>
            <span className="divider header-top-divider"></span>
            {/* Correção (auditoria pós-lançamento): este botão de telefone no topo
                abria o discador do celular em vez do WhatsApp da loja. Trocado para
                whatsappHref — mesmo padrão já usado no rodapé/página de contato. */}
            <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="header-top-phone">
              <Icon name="phone" size={12} className="header-top-phone-icon" />
              {CONTACT.phoneDisplay}
            </a>
            <span className="divider header-top-divider header-top-divider-account"></span>
            <Link href="/conta" className="header-top-account">Minha Conta</Link>
          </span>
        </div>
      </div>

      <div className="container header-main">
        <Link className="header-logo" href="/">
          <Image src="/assets/logo-emblem.png" alt="La Zecca" width={56} height={56} />
          <div>
            <div className="header-logo-text">LA ZECCA</div>
            <span className="header-logo-tag">Numismática · desde 1998</span>
          </div>
        </Link>

        <form className="header-search" onSubmit={handleSearch} role="search">
          <button type="submit" aria-label="Buscar" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer' }}>
            <Icon name="search" size={18} />
          </button>
          <input
            type="search"
            placeholder="Buscar por peça, país, ano..."
            aria-label="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <Link className="icon-btn" href="/conta" aria-label="Minha conta">
            <Icon name="user" />
          </Link>
          <Link className="icon-btn" href="/favoritos" aria-label="Favoritos">
            <Icon name="heart" />
          </Link>
          <Link className="icon-btn" href="/carrinho" aria-label="Carrinho">
            <Icon name="cart" />
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
          <button
            type="button"
            className="icon-btn nav-toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </div>

      <nav className="nav-primary">
        <div className="container">
          <ul>
            {nav.map((n) => (
              <li key={n.key}>
                <Link href={n.href} className={page === n.key ? 'active' : ''}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Drawer mobile — só existe/aparece em telas <=900px (ver globals.css).
          Renderizado via portal em document.body (não dentro de <header>)
          porque o header usa backdrop-filter, que cria um "containing block"
          para position:fixed — isso fazia o overlay/drawer ficarem restritos
          à altura do header em vez de cobrir a tela inteira. Em desktop o
          CSS mantém tudo com display:none, então isso não afeta o layout
          desktop de nenhuma forma. */}
      {mounted &&
        createPortal(
          <>
            <div
              className={`nav-drawer-overlay${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen(false)}
              aria-hidden={!menuOpen}
            />
            <div
              id="mobile-nav-drawer"
              className={`nav-drawer${menuOpen ? ' is-open' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
            >
              <div className="nav-drawer-head">
                <span className="header-logo-text" style={{ fontSize: 18 }}>MENU</span>
                <button type="button" className="icon-btn" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
                  <Icon name="x" />
                </button>
              </div>
              <ul className="nav-drawer-list">
                {nav.map((n) => (
                  <li key={n.key}>
                    <Link href={n.href} className={page === n.key ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="nav-drawer-foot">
                <Link href="/conta" onClick={() => setMenuOpen(false)}>
                  <Icon name="user" size={16} /> Minha Conta
                </Link>
                <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Icon name="phone" size={16} /> {CONTACT.phoneDisplay}
                </a>
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}
