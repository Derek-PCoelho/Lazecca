'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import PasswordStrengthHints from '@/components/PasswordStrengthHints';
import {
  validateFullName, validateEmail, validatePasswordStrength, validateCpf, validatePhone,
  formatCpf, formatPhone,
} from '@/lib/validation';
import OrdersTab from './OrdersTab';
import FavoritesTab from './FavoritesTab';
import CertificatesTab from './CertificatesTab';
import AddressesTab from './AddressesTab';
import ProfileTab from './ProfileTab';

// =============================================================================
// Recriado a partir de design_files/account.html — agora com AUTENTICAÇÃO REAL
// (Fase 8 — Melhoria 3) e dashboard completo (Bloco 1 — antes os 5 links do
// menu lateral eram href="#" mortos; agora cada um abre uma aba real com tela
// própria e API própria).
//
// - login/cadastro chamam /api/auth/login e /api/auth/register (bcrypt + JWT
//   em cookie httpOnly, ver lib/auth.js) — nada de localStorage.
// - o dashboard busca o usuário logado em /api/auth/me e os pedidos reais do
//   usuário em /api/orders (Order/OrderItem, Prisma) — sem dados hardcoded.
// - ?redirect=/algum/caminho é respeitado após login/cadastro bem-sucedido
//   (usado pelos botões "Comprar"/"Favoritar" quando o visitante não está logado).
// =============================================================================

const TABS = [
  { key: 'pedidos', label: 'Meus Pedidos', icon: 'cart' },
  { key: 'favoritos', label: 'Peças Favoritas', icon: 'heart' },
  { key: 'certificados', label: 'Meus Certificados', icon: 'shield' },
  { key: 'enderecos', label: 'Endereços', icon: 'map-pin' },
  { key: 'dados', label: 'Dados pessoais', icon: 'user' },
];

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('login');
  const [activeSection, setActiveSection] = useState('pedidos');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '', lastName: '', email: '', cpf: '', phone: '', password: '', wantsNewsletter: true,
  });
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!loginForm.email) {
      setError('Digite seu e-mail no campo acima antes de clicar em "Esqueci minha senha".');
      return;
    }
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email }),
      });
      setForgotSent(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
  };

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

  // Após login/cadastro bem-sucedido, respeita ?redirect=... (ex: veio de
  // "Comprar" sem estar logado) em vez de sempre cair no dashboard.
  const afterAuthSuccess = async () => {
    await loadMe();
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

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
      await afterAuthSuccess();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const validateSignup = () => {
    const errs = {};
    const nameCheck = validateFullName(`${signupForm.firstName} ${signupForm.lastName}`);
    if (!nameCheck.valid) errs.firstName = nameCheck.reason;

    const emailCheck = validateEmail(signupForm.email);
    if (!emailCheck.valid) errs.email = emailCheck.reason;

    if (signupForm.cpf) {
      const cpfCheck = validateCpf(signupForm.cpf);
      if (!cpfCheck.valid) errs.cpf = cpfCheck.reason;
    } else {
      errs.cpf = 'Informe seu CPF.';
    }

    if (signupForm.phone) {
      const phoneCheck = validatePhone(signupForm.phone);
      if (!phoneCheck.valid) errs.phone = phoneCheck.reason;
    } else {
      errs.phone = 'Informe seu celular.';
    }

    const passwordCheck = validatePasswordStrength(signupForm.password);
    if (!passwordCheck.valid) errs.password = passwordCheck.failures.join(' ');

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateSignup()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível criar sua conta.');
        if (data.field) setFieldErrors((f) => ({ ...f, [data.field]: data.error }));
        return;
      }
      await afterAuthSuccess();
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
                {TABS.map((t) => (
                  <li key={t.key}>
                    <a
                      href="#"
                      className={activeSection === t.key ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); setActiveSection(t.key); }}
                    >
                      <Icon name={t.icon} size={16} /> {t.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="logout" onClick={logout}>
                <Icon name="x" size={16} /> Sair da conta
              </div>
            </aside>

            <main className="dashboard-main">
              {activeSection === 'pedidos' && <OrdersTab orders={orders} />}
              {activeSection === 'favoritos' && <FavoritesTab />}
              {activeSection === 'certificados' && <CertificatesTab orders={orders} />}
              {activeSection === 'enderecos' && <AddressesTab />}
              {activeSection === 'dados' && <ProfileTab user={user} onUpdated={setUser} />}
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
                <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setFieldErrors({}); }}>Entrar</div>
                <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); setFieldErrors({}); }}>Criar Conta</div>
              </div>

              {error && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
              )}
              {redirectTo && (
                <p style={{ color: 'var(--ink-500)', fontSize: 13, marginBottom: 12 }}>
                  Entre ou cadastre-se para continuar.
                </p>
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
                    <div className="auth-forgot">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}
                      >
                        {forgotSent ? 'Link enviado! Verifique seu e-mail.' : 'Esqueci minha senha'}
                      </a>
                    </div>
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
                        {fieldErrors.firstName && <ErrorText>{fieldErrors.firstName}</ErrorText>}
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
                      {fieldErrors.email && <ErrorText>{fieldErrors.email}</ErrorText>}
                    </div>
                    <div className="auth-row">
                      <div className="field">
                        <label>CPF</label>
                        <input
                          required
                          placeholder="000.000.000-00"
                          value={signupForm.cpf}
                          onChange={(e) => setSignupForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }))}
                        />
                        {fieldErrors.cpf && <ErrorText>{fieldErrors.cpf}</ErrorText>}
                      </div>
                      <div className="field">
                        <label>Celular</label>
                        <input
                          required
                          placeholder="(00) 00000-0000"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                        />
                        {fieldErrors.phone && <ErrorText>{fieldErrors.phone}</ErrorText>}
                      </div>
                    </div>
                    <div className="field">
                      <label>Senha</label>
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 12 caracteres"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                      />
                      <PasswordStrengthHints password={signupForm.password} />
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

function ErrorText({ children }) {
  return <span style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, display: 'block' }}>{children}</span>;
}
