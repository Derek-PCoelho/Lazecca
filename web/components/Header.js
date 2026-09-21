'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { cartCount, CART_CHANGED_EVENT } from '@/lib/cart';
import { CONTACT } from '@/lib/config';

// Recriado literalmente de design_files/js/components.jsx — Header
// page prop identifica o item ativo da nav-primary (mesmos 6 links do protótipo)
export default function Header({ page = 'home' }) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');

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

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo');
  };

  const nav = [
    { key: 'home', label: 'Início', href: '/' },
    { key: 'catalog', label: 'Catálogo', href: '/catalogo' },
    { key: 'blog', label: 'Diário', href: '/diario' },
    { key: 'about', label: 'Sobre', href: '/sobre' },
    { key: 'auth', label: 'Autenticidade', href: '/autenticidade' },
    { key: 'contact', label: 'Contato', href: '/contato' },
  ];

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container header-top-inner">
          <span>Curadoria numismática · desde 1998</span>
          <span>
            <Link href="/autenticidade">Autenticidade garantida</Link>
            <span className="divider"></span>
            <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
            <span className="divider"></span>
            <Link href="/conta">Minha Conta</Link>
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
    </header>
  );
}
