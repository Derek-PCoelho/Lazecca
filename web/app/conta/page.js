'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { ALL_PRODUCTS, formatPrice } from '@/lib/data';

// =============================================================================
// Recriado literalmente de design_files/account.html
//
// ATENÇÃO — MOCK INTENCIONAL (Melhoria 3 fora de escopo / Fase Futura):
// O megaprompt define explicitamente que a "Melhoria 3 (autenticação real)"
// NÃO deve ser implementada neste ciclo de créditos. Esta página preserva,
// de propósito, o comportamento 100% mockado do protótipo original:
//   - login()/logout() apenas gravam/removem a flag 'lz_logged' no
//     localStorage (mesma chave usada em components.jsx no protótipo);
//   - não há validação de senha, chamada de API, sessão de servidor ou
//     hashing de credenciais;
//   - o usuário exibido no dashboard é sempre fixo: "Marco Aurélio" /
//     "marco@email.com" (idêntico ao account.html original);
//   - os 3 pedidos do dashboard são hardcoded e apontam para índices fixos
//     do array de produtos (products[0], products[3], products[6],
//     products[4], products[5], products[7]) — exatamente como no
//     protótipo original em design_files/account.html linha ~362-364.
// Quando a Melhoria 3 for endereçada em uma fase futura, o modelo de dados
// do usuário deve reservar um campo `passwordHash` (nunca a senha em texto
// puro) e os pedidos devem vir de uma API real de pedidos por usuário.
// =============================================================================

export default function AccountPage() {
  // localStorage só existe no client; useState lazy-init roda após o mount
  // em React 18 com 'use client', mas para evitar mismatch de hidratação em
  // export estático, inicializamos em 'login' e corrigimos no primeiro
  // render via função abaixo (mesma abordagem simples do protótipo).
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'login';
    return window.localStorage.getItem('lz_logged') === '1' ? 'dashboard' : 'login';
  });
  const [tab, setTab] = useState('login');

  const login = () => {
    window.localStorage.setItem('lz_logged', '1');
    setMode('dashboard');
  };
  const logout = () => {
    window.localStorage.removeItem('lz_logged');
    setMode('login');
  };

  // Pedidos mockados — índices fixos preservados literalmente do protótipo.
  const products = ALL_PRODUCTS;
  const orders = [
    { num: '#LZ-2026-08192', date: '02 Set 2026', status: 'delivered', statusLabel: 'Entregue', items: [products[0], products[3]].filter(Boolean), total: 25280 },
    { num: '#LZ-2026-07811', date: '18 Ago 2026', status: 'shipped', statusLabel: 'Em trânsito', items: [products[6]].filter(Boolean), total: 145 },
    { num: '#LZ-2026-06455', date: '02 Jul 2026', status: 'delivered', statusLabel: 'Entregue', items: [products[4], products[5], products[7]].filter(Boolean), total: 3820 },
  ];

  if (mode === 'dashboard') {
    return (
      <>
        <Header page="account" />
        <div className="container">
          <div className="dashboard-layout">
            <aside className="dashboard-nav">
              <div className="dashboard-user">
                <div className="avatar">M</div>
                <div>
                  <div className="name">Marco Aurélio</div>
                  <div className="email">marco@email.com</div>
                </div>
              </div>
              <ul>
                <li><a href="#" className="active"><Icon name="cart" size={16} /> Meus Pedidos</a></li>
                <li><a href="#"><Icon name="heart" size={16} /> Peças Favoritas</a></li>
                <li><a href="#"><Icon name="shield" size={16} /> Meus Certificados</a></li>
                <li><a href="#"><Icon name="map-pin" size={16} /> Endereços</a></li>
                <li><a href="#"><Icon name="user" size={16} /> Dados pessoais</a></li>
                <li><a href="#"><Icon name="mail" size={16} /> Preferências de e-mail</a></li>
              </ul>
              <div className="logout" onClick={logout}>
                <Icon name="x" size={16} /> Sair da conta
              </div>
            </aside>

            <main className="dashboard-main">
              <div className="dash-header">
                <span className="eyebrow">Minha Conta</span>
                <h2>Meus Pedidos</h2>
                <p style={{ color: 'var(--ink-500)', marginTop: 8 }}>
                  Acompanhe suas compras e baixe os certificados de autenticidade.
                </p>
              </div>

              {orders.map((o) => (
                <div key={o.num} className="order-card">
                  <div className="order-header">
                    <div>
                      <div className="order-num">Pedido {o.num}</div>
                      <div className="order-date">Realizado em {o.date}</div>
                    </div>
                    <span className={`order-status ${o.status}`}>{o.statusLabel}</span>
                  </div>
                  <div className="order-items">
                    {o.items.map((p) => (
                      <div key={p.id} className="order-item-thumb">
                        <img src={p.image || (p.images && p.images[0])} alt={p.name} />
                      </div>
                    ))}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: 'var(--ink-800)', fontWeight: 500 }}>
                        {o.items.map((i) => i.name).join(' · ')}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
                        {o.items.length} {o.items.length === 1 ? 'peça' : 'peças'}
                      </div>
                    </div>
                  </div>
                  <div className="order-footer">
                    <div className="order-total">{formatPrice(o.total)}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm"><Icon name="shield" size={14} /> Baixar Certificado</button>
                      <button className="btn btn-outline btn-sm">Ver detalhes</button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Link href="/catalogo" className="btn btn-primary btn-lg">Explorar mais peças</Link>
              </div>
            </main>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Modo login/signup
  return (
    <>
      <Header page="account" />
      <div className="auth-page">
        <div className="container">
          <div className="auth-layout">
            <div className="auth-side">
              <div>
                <div className="auth-side-emblem">
                  <img src="/assets/logo-emblem.png" alt="" />
                </div>
              </div>
              <div>
                <h2>Bem-vindo(a) à<br /><em>casa dos colecionadores</em></h2>
              </div>
              <div>
                <blockquote>
                  &quot;Uma coleção começa no dia em que você percebe que uma única moeda pode conter um século.&quot;
                </blockquote>
                <div className="attribution">— Dr. Sergio Costa</div>
              </div>
              <ul className="auth-side-perks">
                <li><Icon name="check" size={16} /> Acompanhe pedidos e certificados</li>
                <li><Icon name="check" size={16} /> Peças favoritas em uma lista</li>
                <li><Icon name="check" size={16} /> Acesso ao Correio do Curador</li>
                <li><Icon name="check" size={16} /> Descontos para colecionadores frequentes</li>
              </ul>
            </div>

            <div className="auth-main">
              <div className="auth-tabs">
                <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Entrar</div>
                <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Criar Conta</div>
              </div>

              {tab === 'login' ? (
                <>
                  <h2>Entrar na minha conta</h2>
                  <p className="sub">Que bom ter você de volta.</p>
                  <form className="auth-form" onSubmit={(e) => { e.preventDefault(); login(); }}>
                    <div className="field">
                      <label>E-mail</label>
                      <input type="email" required placeholder="voce@email.com.br" defaultValue="marco@email.com" />
                    </div>
                    <div className="field">
                      <label>Senha</label>
                      <input type="password" required placeholder="Sua senha" defaultValue="********" />
                    </div>
                    <div className="auth-forgot"><a href="#">Esqueci minha senha</a></div>
                    <button className="btn btn-primary btn-lg btn-block" type="submit">Entrar</button>
                  </form>
                  <div className="social-divider">ou entrar com</div>
                  <div className="social-buttons">
                    <button className="social-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.4-4.9 3.4-8.4z" />
                        <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8L15.9 18.4c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.7v3C3.6 21.5 7.5 24 12 24z" />
                        <path fill="#FBBC04" d="M5.6 14.8c-.2-.7-.4-1.4-.4-2.2 0-.8.1-1.5.4-2.2v-3H1.7C.9 8.9.5 10.4.5 12s.4 3.1 1.2 4.4l3.9-1.6z" />
                        <path fill="#EA4335" d="M12 4.7c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.5 0 3.6 2.6 1.7 6.4l3.9 3c.9-2.7 3.4-4.7 6.4-4.7z" />
                      </svg>
                      Google
                    </button>
                    <button className="social-btn">
                      <Icon name="facebook" size={18} /> Facebook
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2>Criar minha conta</h2>
                  <p className="sub">Rápido, sem complicação. Seus dados ficam com a gente.</p>
                  <form className="auth-form" onSubmit={(e) => { e.preventDefault(); login(); }}>
                    <div className="auth-row">
                      <div className="field">
                        <label>Nome</label>
                        <input required placeholder="Primeiro nome" />
                      </div>
                      <div className="field">
                        <label>Sobrenome</label>
                        <input required placeholder="Sobrenome" />
                      </div>
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input type="email" required placeholder="voce@email.com.br" />
                    </div>
                    <div className="auth-row">
                      <div className="field">
                        <label>CPF</label>
                        <input required placeholder="000.000.000-00" />
                      </div>
                      <div className="field">
                        <label>Celular</label>
                        <input required placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Senha</label>
                      <input type="password" required placeholder="Mínimo 8 caracteres" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--ink-500)' }}>
                      <input type="checkbox" defaultChecked style={{ marginTop: 3, accentColor: 'var(--burgundy-700)' }} />
                      <span>Quero receber o Correio do Curador semanal</span>
                    </div>
                    <button className="btn btn-primary btn-lg btn-block" type="submit">Criar minha conta</button>
                    <p style={{ fontSize: 12, color: 'var(--ink-500)', textAlign: 'center', marginTop: 8 }}>
                      Ao criar sua conta, você aceita nossos{' '}
                      <Link href="/termos-de-uso" style={{ color: 'var(--burgundy-700)' }}>Termos</Link>{' '}
                      e a{' '}
                      <Link href="/politica-de-privacidade" style={{ color: 'var(--burgundy-700)' }}>Política de Privacidade</Link>.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
