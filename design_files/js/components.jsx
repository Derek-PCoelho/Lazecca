// La Zecca — Componentes compartilhados
const { useState, useEffect, useMemo, useRef } = React;

// ============ Ícones (SVG stroke) ============
const Icon = ({ name, size = 20, ...props }) => {
  const s = size;
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'user': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>;
    case 'heart': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M12 20s-7-4.5-9-9.5C1.5 6 5 3 8 4.5c2 1 3 3 4 4 1-1 2-3 4-4 3-1.5 6.5 1.5 5 6-2 5-9 9.5-9 9.5z"/></svg>;
    case 'cart': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M4 5h2l2.5 11.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5L21 8H7"/><circle cx="10" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/></svg>;
    case 'menu': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'coin': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>;
    case 'bill': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><rect x="2" y="6" width="20" height="12" rx="1.5"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9h.5M17.5 9h.5M6 15h.5M17.5 15h.5"/></svg>;
    case 'star': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M12 3l2.5 5.5 6 .8-4.5 4 1.2 6L12 16.5 6.8 19.3 8 13.3 3.5 9.3l6-.8L12 3z"/></svg>;
    case 'star-filled': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 3l2.5 5.5 6 .8-4.5 4 1.2 6L12 16.5 6.8 19.3 8 13.3 3.5 9.3l6-.8L12 3z"/></svg>;
    case 'kit': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><rect x="3" y="6" width="18" height="14" rx="1.5"/><path d="M8 6V4h8v2M3 12h18"/></svg>;
    case 'lens': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/></svg>;
    case 'gem': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M6 3h12l3 6-9 12L3 9l3-6z"/><path d="M3 9h18M9 3l3 6 3-6M9 9l3 12 3-12"/></svg>;
    case 'shield': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'truck': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><rect x="2" y="7" width="12" height="10" rx="1"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>;
    case 'award': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><circle cx="12" cy="9" r="6"/><path d="M8.5 14l-2 7 5.5-3 5.5 3-2-7"/><path d="M12 6l1 2 2 .3-1.5 1.4.4 2.1L12 10.8l-1.9 1 .4-2.1L9 8.3 11 8l1-2z"/></svg>;
    case 'refresh': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>;
    case 'chevron-right': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-left': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-down': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'x': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'plus': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M5 12h14"/></svg>;
    case 'check': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M4 12l5 5 11-11"/></svg>;
    case 'phone': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
    case 'mail': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'map-pin': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M12 22s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'clock': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'zoom-in': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg>;
    case 'quote': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M6 4c-2 2-3 5-3 9v7h7v-9H6V9c0-2 .5-3 2-4L6 4zm10 0c-2 2-3 5-3 9v7h7v-9h-4V9c0-2 .5-3 2-4l-2-1z"/></svg>;
    case 'sparkles': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zM19 14l1 2.5 2.5 1L20 18.5 19 21l-1-2.5L15.5 17.5 18 16.5 19 14z"/></svg>;
    case 'facebook': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l1-4h-4V7.5c0-1 .3-2 2-2h2V2h-3c-3 0-5 2-5 5v3H6v4h3v8h4z"/></svg>;
    case 'instagram': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>;
    case 'whatsapp': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1 1 20 12c0 4.4-3.6 8-8 8zm4.5-6c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.2-.5s0-.4-.1-.5c-.1-.1-.6-1.5-.9-2-.2-.5-.5-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9 1-.9 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.8 4.3 2.9 1.1 2.9.7 3.4.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>;
    case 'pix': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M12 2l4 4-4 4-4-4 4-4z"/><path d="M6 8l-4 4 4 4M18 8l4 4-4 4M12 14l4 4-4 4-4-4 4-4z"/></svg>;
    case 'sliders': return <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} {...props}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h14M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg>;
    default: return null;
  }
};

// ============ Header ============
const Header = ({ page = 'home' }) => {
  const [cartCount, setCartCount] = useState(LZ.cartCount());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const update = () => setCartCount(LZ.cartCount());
    window.addEventListener('lz-cart-changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('lz-cart-changed', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const nav = [
    { key: 'home', label: 'Início', href: 'index.html' },
    { key: 'catalog', label: 'Catálogo', href: 'catalog.html' },
    { key: 'blog', label: 'Diário', href: 'blog.html' },
    { key: 'about', label: 'Sobre', href: 'about.html' },
    { key: 'auth', label: 'Autenticidade', href: 'authenticity.html' },
    { key: 'contact', label: 'Contato', href: 'contact.html' },
  ];

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container header-top-inner">
          <span>Curadoria numismática · desde 1998</span>
          <span>
            <a href="authenticity.html">Autenticidade garantida</a>
            <span className="divider"></span>
            <a href="tel:+558596553044">(85) 9655-3044</a>
            <span className="divider"></span>
            <a href="account.html">Minha Conta</a>
          </span>
        </div>
      </div>

      <div className="container header-main">
        <a className="header-logo" href="index.html">
          <img src="assets/logo-emblem.png" alt="La Zecca" />
          <div>
            <div className="header-logo-text">LA ZECCA</div>
            <span className="header-logo-tag">Numismática · desde 1998</span>
          </div>
        </a>

        <div className="header-search">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Buscar por peça, país, ano..." />
        </div>

        <div className="header-actions">
          <a className="icon-btn" href="account.html" aria-label="Minha conta"><Icon name="user" /></a>
          <a className="icon-btn" href="#" aria-label="Favoritos"><Icon name="heart" /></a>
          <a className="icon-btn" href="cart.html" aria-label="Carrinho">
            <Icon name="cart" />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </a>
        </div>
      </div>

      <nav className="nav-primary">
        <div className="container">
          <ul>
            {nav.map(n => (
              <li key={n.key}>
                <a href={n.href} className={page === n.key ? 'active' : ''}>{n.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

// ============ Footer ============
const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="assets/logo-emblem.png" alt="La Zecca" />
          <h4>LA ZECCA</h4>
          <p>Curadoria numismática desde 1998. Cada peça em nosso acervo é verificada, catalogada e apresentada pelo Dr. Sergio Costa e sua equipe de especialistas.</p>
          <div style={{display: 'flex', gap: 12, marginTop: 18}}>
            <a href="#" style={{color: 'var(--gold-500)'}}><Icon name="instagram" size={22}/></a>
            <a href="#" style={{color: 'var(--gold-500)'}}><Icon name="facebook" size={22}/></a>
            <a href="#" style={{color: 'var(--gold-500)'}}><Icon name="whatsapp" size={22}/></a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Catálogo</h5>
          <ul>
            <li><a href="catalog.html?cat=cedulas-br">Cédulas Brasileiras</a></li>
            <li><a href="catalog.html?cat=cedulas-int">Cédulas Estrangeiras</a></li>
            <li><a href="catalog.html?cat=moedas-br">Moedas Brasileiras</a></li>
            <li><a href="catalog.html?cat=moedas-int">Moedas Estrangeiras</a></li>
            <li><a href="catalog.html?cat=comemorativas">Comemorativas</a></li>
            <li><a href="catalog.html?cat=acessorios">Acessórios</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Institucional</h5>
          <ul>
            <li><a href="about.html">Nossa História</a></li>
            <li><a href="authenticity.html">Autenticidade</a></li>
            <li><a href="blog.html">Diário Numismático</a></li>
            <li><a href="contact.html">Contato</a></li>
            <li><a href="#">Política de Privacidade</a></li>
            <li><a href="#">Termos de Uso</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Atendimento</h5>
          <ul>
            <li><a href="tel:+558596553044"><Icon name="phone" size={14}/> (85) 9655-3044</a></li>
            <li><a href="mailto:atendimento@lazecca.com.br"><Icon name="mail" size={14}/> atendimento@lazecca.com.br</a></li>
            <li><a href="#"><Icon name="map-pin" size={14}/> R. do Pocinho, 33 · Sala 425 · Fortaleza/CE</a></li>
            <li><a href="#"><Icon name="clock" size={14}/> Seg à Sex · 09h às 16h</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 La Zecca Numismática · Fortaleza/CE · lazecca.com.br</span>
        <div className="payment-methods">
          <span>PIX</span>
          <span>VISA</span>
          <span>MASTER</span>
          <span>AMEX</span>
          <span>BOLETO</span>
        </div>
      </div>
    </div>
  </footer>
);

// ============ Product Card ============
const ProductCard = ({ product: p }) => (
  <a href={`product.html?id=${p.slug}`} className="product-card card">
    <div className="product-media">
      <img src={p.image} alt={p.name} />
      <div className="product-seals">
        {p.seals.includes('rare') && <span className="seal seal-rare"><Icon name="sparkles" size={12}/> Rara</span>}
        {p.seals.includes('authenticated') && <span className="seal"><Icon name="shield" size={12}/> Autenticada</span>}
        {p.quantidade > 1 && p.isSequencia && <span className="seal seal-burgundy">Sequência · {p.quantidade}</span>}
        {p.quantidade > 1 && !p.isSequencia && <span className="seal seal-burgundy">Lote · {p.quantidade}</span>}
      </div>
      <span className="quickview">Ver detalhes →</span>
    </div>
    <div className="product-body">
      <div className="product-cat">{p.categoryName}</div>
      <div className="product-name">{p.name}</div>
      <div className="product-meta">
        {p.year > 0 && <span>{p.year}</span>}
        {p.year < 0 && <span>{Math.abs(p.year)} a.C.</span>}
        {p.state !== 'Novo' && <span>· <b>{p.state}</b></span>}
        {p.state === 'Novo' && <span>· Novo</span>}
        {p.serie && <span>· Série {p.serie.split(';')[0].trim().substring(0, 8)}</span>}
      </div>
      <div className="product-footer">
        <div>
          <div className="price">{LZ.formatPrice(p.price)}</div>
          {p.priceOld && <div style={{fontSize:12,color:'var(--ink-400)',textDecoration:'line-through'}}>{LZ.formatPrice(p.priceOld)}</div>}
        </div>
        <button className="btn btn-outline btn-sm" onClick={(e) => { e.preventDefault(); LZ.addToCart(p.id); }}>
          <Icon name="cart" size={14}/> Comprar
        </button>
      </div>
    </div>
  </a>
);

// ============ Feature Strip (garantias) ============
const FeatureStrip = () => (
  <div className="container">
    <div className="feature-strip">
      <div className="feature">
        <div className="feature-icon"><Icon name="shield" size={22}/></div>
        <div className="feature-text">
          <div className="feature-title">Certificado de Autenticidade</div>
          <div className="feature-sub">Emitido para cada peça</div>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon"><Icon name="truck" size={22}/></div>
        <div className="feature-text">
          <div className="feature-title">Envio Seguro e Rastreado</div>
          <div className="feature-sub">Frete grátis acima de R$ 500</div>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon"><Icon name="refresh" size={22}/></div>
        <div className="feature-text">
          <div className="feature-title">7 Dias para Devolução</div>
          <div className="feature-sub">Direito de arrependimento</div>
        </div>
      </div>
      <div className="feature">
        <div className="feature-icon"><Icon name="award" size={22}/></div>
        <div className="feature-text">
          <div className="feature-title">Curadoria Especializada</div>
          <div className="feature-sub">Dr. Sergio Costa · 27 anos</div>
        </div>
      </div>
    </div>
  </div>
);

// ============ Ornament Divider ============
const OrnamentDivider = ({ label }) => (
  <div className="ornament">
    <span className="ornament-diamond"></span>
    {label && <span style={{padding:'0 4px'}}>{label}</span>}
    <span className="ornament-diamond"></span>
  </div>
);

// Export to window
Object.assign(window, { Icon, Header, Footer, ProductCard, FeatureStrip, OrnamentDivider });
