'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { formatPrice } from '@/lib/data';

// =============================================================================
// Recriado a partir de design_files/account.html — agora com AUTENTICAÇÃO REAL
// (Fase 8 — Melhoria 3, antes explicitamente fora de escopo, agora endereçada
// por instrução expressa do cliente).
//
// - login/cadastro chamam /api/auth/login e /api/auth/register (bcrypt + JWT
//   em cookie httpOnly, ver lib/auth.js) — nada de localStorage.
// - o dashboard busca o usuário logado em /api/auth/me e os pedidos reais do
//   usuário em /api/orders (Order/OrderItem, Prisma) — sem dados hardcoded.
// =============================================================================

const STATUS_LABELS = {
  AWAITING_PAYMENT: { label: 'Aguardando pagamento', cls: 'shipped' },
  PAID: { label: 'Pago', cls: 'shipped' },
  PROCESSING: { label: 'Em preparação', cls: 'shipped' },
  SHIPPED: { label: 'Em trânsito', cls: 'shipped' },
  DELIVERED: { label: 'Entregue', cls: 'delivered' },
  CANCELLED: { label: 'Cancelado', cls: 'cancelled' },
};

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('login');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '', lastName: '', email: '', cpf: '', phone: '', password: '', wantsNewsletter: true,
  });

  const loadMe = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
      if (data.user) {
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      await loadMe();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível criar sua conta.');
        return;
      }
      await loadMe();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOrders([]);
  };

  if (loading) {
    return (
      <>
        <Header page="account" />
        <div className="container" style={{ padding: '96px 0', textAlign: 'center', color: 'var(--ink-500)' }}>
          Carregando...
        </div>
        <Footer />
      </>
    );
  }

  if (user) {
    return (
      <>
        <Header page="account" />
        <div className="container">
          <div className="dashboard-layout">
            <aside className="dashboard-nav">
              <div className="dashboard-user">
                <div className="avatar">{user.firstName?.[0]?.toUpperCase() || 'U'}</div>
                <div>
                  <div className="name">{user.firstName} {user.lastName}</div>
                  <div className="email">{user.email}</div>
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

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-500)' }}>
                  <Icon name="cart" size={36} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                  <p>Você ainda não fez nenhum pedido.</p>
                </div>
              ) : (
                orders.map((o) => {
                  const statusInfo = STATUS_LABELS[o.status] || { label: o.status, cls: '' };
                  return (
                    <div key={o.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <div className="order-num">Pedido {o.orderNumber}</div>
                          <div className="order-date">Realizado em {new Date(o.createdAt).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <span className={`order-status ${statusInfo.cls}`}>{statusInfo.label}</span>
                      </div>
                      <div className="order-items">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, color: 'var(--ink-800)', fontWeight: 500 }}>
                            {o.items.map((i) => i.productName).join(' · ')}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
                            {o.items.length} {o.items.length === 1 ? 'peça' : 'peças'}
                          </div>
                        </div>
                      </div>
                      <div className="order-footer">
                        <div className="order-total">{formatPrice(o.total)}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm">Ver detalhes</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

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
                <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Entrar</div>
                <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Criar Conta</div>
              </div>

              {error && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
              )}

              {tab === 'login' ? (
                <>
                  <h2>Entrar na minha conta</h2>
                  <p className="sub">Que bom ter você de volta.</p>
                  <form className="auth-form" onSubmit={handleLogin}>
                    <div className="field">
                      <label>E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="voce@email.com.br"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Senha</label>
                      <input
                        type="password"
                        required
                        placeholder="Sua senha"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                    <div className="auth-forgot"><a href="#">Esqueci minha senha</a></div>
                    <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={submitting}>
                      {submitting ? 'Entrando...' : 'Entrar'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2>Criar minha conta</h2>
                  <p className="sub">Rápido, sem complicação. Seus dados ficam com a gente.</p>
                  <form className="auth-form" onSubmit={handleSignup}>
                    <div className="auth-row">
                      <div className="field">
                        <label>Nome</label>
                        <input
                          required
                          placeholder="Primeiro nome"
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm((f) => ({ ...f, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="field">
                        <label>Sobrenome</label>
                        <input
                          required
                          placeholder="Sobrenome"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm((f) => ({ ...f, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="voce@email.com.br"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div className="auth-row">
                      <div className="field">
                        <label>CPF</label>
                        <input
                          required
                          placeholder="000.000.000-00"
                          value={signupForm.cpf}
                          onChange={(e) => setSignupForm((f) => ({ ...f, cpf: e.target.value }))}
                        />
                      </div>
                      <div className="field">
                        <label>Celular</label>
                        <input
                          required
                          placeholder="(00) 00000-0000"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>Senha</label>
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 8 caracteres"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--ink-500)' }}>
                      <input
                        type="checkbox"
                        checked={signupForm.wantsNewsletter}
                        onChange={(e) => setSignupForm((f) => ({ ...f, wantsNewsletter: e.target.checked }))}
                        style={{ marginTop: 3, accentColor: 'var(--burgundy-700)' }}
                      />
                      <span>Quero receber o Correio do Curador semanal</span>
                    </div>
                    <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={submitting}>
                      {submitting ? 'Criando...' : 'Criar minha conta'}
                    </button>
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
