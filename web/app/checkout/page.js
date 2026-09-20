'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/Icon';
import { formatPrice } from '@/lib/data';
import { getCartItems, CART_CHANGED_EVENT } from '@/lib/cart';
import { PIX_DISCOUNT_RATE, SHIPPING_METHODS, getShippingPrice, INSTALLMENTS_MAX } from '@/lib/config';

// Recriado literalmente de design_files/checkout.html
// Melhoria 5: REMOVIDO o useEffect que auto-preenchia p001/p004 quando o carrinho estava vazio.
// Melhoria 2: navegação real por estado entre as 4 etapas (antes exibidas simultaneamente),
//   com validação básica de campos obrigatórios por etapa e ação real (simulada) no botão
//   "Concluir Pedido" — gera número de pedido e mostra tela de confirmação.
// Melhoria 6: frete funcional por transportadora — cada modalidade tem preço/prazo próprios,
//   mantendo a regra de frete grátis acima de R$500 como uma das condições possíveis.
// Nota de arquitetura (Fase 0, seção 8): como o projeto foi exportado como site estático
// (`output: 'export'`, ver next.config.mjs), esta finalização é 100% client-side — não há
// API route de servidor processando pagamento real. Em um ambiente com Node.js habilitado,
// o botão "Concluir Pedido" chamaria uma API route que integraria com um gateway de pagamento.

const STEPS = [
  { key: 'identificacao', num: 1, label: 'Identificação & Entrega' },
  { key: 'pagamento', num: 2, label: 'Pagamento' },
  { key: 'confirmacao', num: 3, label: 'Confirmação' },
];

export default function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [step, setStep] = useState('identificacao');
  const [payment, setPayment] = useState('pix');
  const [shippingMethod, setShippingMethod] = useState('pac');
  const [errors, setErrors] = useState({});
  const [orderNumber, setOrderNumber] = useState('');

  const [form, setForm] = useState({
    nome: '', cpf: '', email: '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'CE',
  });

  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = () =>
      getCartItems().then((it) => {
        if (mounted) {
          setItems(it);
          setLoadingCart(false);
        }
      });
    load();
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => {
      mounted = false;
      window.removeEventListener(CART_CHANGED_EVENT, load);
    };
  }, []);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = useMemo(() => getShippingPrice(shippingMethod, subtotal), [shippingMethod, subtotal]);
  const discount = payment === 'pix' ? subtotal * PIX_DISCOUNT_RATE : 0;
  const total = subtotal + shipping - discount;

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateIdentificacao = () => {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Informe seu nome completo';
    if (!form.cpf.trim()) errs.cpf = 'Informe seu CPF';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Informe um e-mail válido';
    if (!form.telefone.trim()) errs.telefone = 'Informe seu telefone';
    if (!form.cep.trim()) errs.cep = 'Informe o CEP';
    if (!form.rua.trim()) errs.rua = 'Informe a rua';
    if (!form.numero.trim()) errs.numero = 'Informe o número';
    if (!form.bairro.trim()) errs.bairro = 'Informe o bairro';
    if (!form.cidade.trim()) errs.cidade = 'Informe a cidade';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToPagamento = () => {
    if (validateIdentificacao()) setStep('pagamento');
  };

  const finalizarPedido = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: form.nome,
            cpf: form.cpf,
            email: form.email,
            phone: form.telefone,
          },
          address: {
            street: form.rua,
            number: form.numero,
            complement: form.complemento,
            neighborhood: form.bairro,
            city: form.cidade,
            state: form.estado,
            zipCode: form.cep,
          },
          shippingMethod,
          paymentMethod: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Não foi possível concluir o pedido. Tente novamente.');
        setSubmitting(false);
        return;
      }
      setOrderNumber(data.order.orderNumber);
      setStep('confirmacao');
    } catch (err) {
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loadingCart && items.length === 0 && step !== 'confirmacao') {
    return (
      <>
        <CheckoutHeader />
        <div className="container" style={{ padding: '96px 0', textAlign: 'center' }}>
          <h1 className="h1">Seu carrinho está vazio</h1>
          <p className="lede" style={{ margin: '16px auto 32px', maxWidth: 420 }}>
            Adicione peças ao carrinho antes de prosseguir para o checkout.
          </p>
          <Link href="/catalogo" className="btn btn-primary btn-lg">
            Ir ao catálogo
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <CheckoutHeader />

      <div className="steps-bar">
        <div className="step-item done">
          <span className="step-num">
            <Icon name="check" size={14} />
          </span>
          <span className="step-label">Carrinho</span>
        </div>
        {STEPS.map((s) => {
          const stepOrder = STEPS.findIndex((x) => x.key === step);
          const thisOrder = STEPS.findIndex((x) => x.key === s.key);
          const isDone = thisOrder < stepOrder;
          const isActive = s.key === step;
          return (
            <div key={s.key} className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <span className="step-num">{isDone ? <Icon name="check" size={14} /> : s.num}</span>
              <span className="step-label">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="checkout-page">
        <div className="container">
          {step === 'confirmacao' ? (
            <ConfirmacaoPanel orderNumber={orderNumber} />
          ) : (
            <div className="checkout-layout">
              <div>
                {step === 'identificacao' && (
                  <IdentificacaoPanel form={form} setField={setField} errors={errors} onNext={goToPagamento} />
                )}
                {step === 'pagamento' && (
                  <PagamentoPanel
                    payment={payment}
                    setPayment={setPayment}
                    total={total}
                    onBack={() => setStep('identificacao')}
                  />
                )}
              </div>

              <aside className="summary">
                <h3>Seu Pedido</h3>
                <div className="cart-mini">
                  {items.map((item) => (
                    <div key={item.product.id} className="cart-mini-item">
                      <div className="thumb">
                        <Image src={`/${item.product.image}`} alt={item.product.name} width={60} height={60} style={{ objectFit: 'contain' }} />
                        {item.qty > 1 && <span className="qty-badge">{item.qty}</span>}
                      </div>
                      <div>
                        <div className="name">{item.product.name}</div>
                        <div className="meta">
                          {item.product.year > 0 && item.product.year} · {item.product.state}
                        </div>
                      </div>
                      <div className="item-price">{formatPrice(item.product.price * item.qty)}</div>
                    </div>
                  ))}
                </div>

                {step === 'identificacao' ? (
                  <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                    O frete será calculado com base na modalidade escolhida na etapa de Endereço.
                  </div>
                ) : (
                  <>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label>Modalidade de envio</label>
                      <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                        {SHIPPING_METHODS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label} · {m.prazo} · {getShippingPrice(m.id, subtotal) === 0 ? 'Grátis' : formatPrice(getShippingPrice(m.id, subtotal))}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Frete</span>
                        <span>{shipping === 0 ? <b style={{ color: 'var(--success)' }}>Grátis</b> : formatPrice(shipping)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="summary-row">
                          <span>Desconto PIX (5%)</span>
                          <span style={{ color: 'var(--danger)' }}>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="summary-row total">
                        <span>
                          <b>Total</b>
                        </span>
                        <span className="val">{formatPrice(total)}</span>
                      </div>
                    </div>

                    {submitError && (
                      <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{submitError}</p>
                    )}
                    <button
                      className="btn btn-primary btn-lg btn-block"
                      style={{ marginTop: 20 }}
                      onClick={finalizarPedido}
                      disabled={submitting}
                    >
                      {submitting ? 'Processando...' : 'Concluir Pedido'} <Icon name="check" size={16} />
                    </button>
                  </>
                )}
                <p style={{ fontSize: 12, color: 'var(--ink-500)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                  Ao concluir, você concorda com os{' '}
                  <Link href="/termos-de-uso" style={{ color: 'var(--burgundy-700)' }}>
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link href="/politica-de-privacidade" style={{ color: 'var(--burgundy-700)' }}>
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CheckoutHeader() {
  return (
    <header className="checkout-header">
      <div className="container checkout-header-inner">
        <Link href="/" className="checkout-header-logo">
          <Image src="/assets/logo-emblem.png" alt="La Zecca" width={44} height={44} style={{ borderRadius: '50%' }} />
          <span className="checkout-header-logo-text">LA ZECCA</span>
        </Link>
        <div className="checkout-secure">
          <Icon name="shield" size={16} /> Compra 100% Segura · SSL
        </div>
      </div>
    </header>
  );
}

function IdentificacaoPanel({ form, setField, errors, onNext }) {
  return (
    <>
      <div className="checkout-panel">
        <h3>
          <span className="n">1</span> Identificação
        </h3>
        <div className="field-row">
          <div className="field">
            <label>Nome completo</label>
            <input placeholder="Como no documento" value={form.nome} onChange={setField('nome')} />
            {errors.nome && <ErrorText>{errors.nome}</ErrorText>}
          </div>
          <div className="field">
            <label>CPF / CNPJ</label>
            <input placeholder="000.000.000-00" value={form.cpf} onChange={setField('cpf')} />
            {errors.cpf && <ErrorText>{errors.cpf}</ErrorText>}
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>E-mail</label>
            <input type="email" placeholder="voce@email.com.br" value={form.email} onChange={setField('email')} />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </div>
          <div className="field">
            <label>Telefone (WhatsApp)</label>
            <input placeholder="(11) 90000-0000" value={form.telefone} onChange={setField('telefone')} />
            {errors.telefone && <ErrorText>{errors.telefone}</ErrorText>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-500)' }}>
          <input type="checkbox" id="ck-news" defaultChecked style={{ accentColor: 'var(--burgundy-700)' }} />
          <label htmlFor="ck-news">Quero receber o Correio do Curador</label>
        </div>
      </div>

      <div className="checkout-panel">
        <h3>
          <span className="n">2</span> Endereço de Entrega
        </h3>
        <div className="field-row narrow-first">
          <div className="field">
            <label>CEP</label>
            <input placeholder="00000-000" value={form.cep} onChange={setField('cep')} />
            {errors.cep && <ErrorText>{errors.cep}</ErrorText>}
          </div>
          <div className="field">
            <label>Rua / Avenida</label>
            <input placeholder="Rua ..." value={form.rua} onChange={setField('rua')} />
            {errors.rua && <ErrorText>{errors.rua}</ErrorText>}
          </div>
        </div>
        <div className="field-row narrow-first">
          <div className="field">
            <label>Número</label>
            <input placeholder="000" value={form.numero} onChange={setField('numero')} />
            {errors.numero && <ErrorText>{errors.numero}</ErrorText>}
          </div>
          <div className="field">
            <label>Complemento</label>
            <input placeholder="Apto, casa..." value={form.complemento} onChange={setField('complemento')} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Bairro</label>
            <input placeholder="Bairro" value={form.bairro} onChange={setField('bairro')} />
            {errors.bairro && <ErrorText>{errors.bairro}</ErrorText>}
          </div>
          <div className="field">
            <label>Cidade</label>
            <input placeholder="Cidade" value={form.cidade} onChange={setField('cidade')} />
            {errors.cidade && <ErrorText>{errors.cidade}</ErrorText>}
          </div>
        </div>
        <div className="field-row three">
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={setField('estado')}>
              <option>CE</option>
              <option>SP</option>
              <option>RJ</option>
              <option>MG</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 8 }} onClick={onNext}>
          Continuar para Pagamento <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </>
  );
}

function PagamentoPanel({ payment, setPayment, total, onBack }) {
  return (
    <div className="checkout-panel">
      <h3>
        <span className="n">3</span> Pagamento
      </h3>

      <div className="pay-methods">
        <div className={`pay-method ${payment === 'pix' ? 'active' : ''}`} onClick={() => setPayment('pix')}>
          <span className="radio"></span>
          <div>
            <div className="pm-title">
              <Icon name="pix" size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> PIX
            </div>
            <div className="pm-sub">5% off · aprovação imediata</div>
          </div>
        </div>
        <div className={`pay-method ${payment === 'card' ? 'active' : ''}`} onClick={() => setPayment('card')}>
          <span className="radio"></span>
          <div>
            <div className="pm-title">Cartão de Crédito</div>
            <div className="pm-sub">Até 10× sem juros</div>
          </div>
        </div>
        <div className={`pay-method ${payment === 'boleto' ? 'active' : ''}`} onClick={() => setPayment('boleto')}>
          <span className="radio"></span>
          <div>
            <div className="pm-title">Boleto Bancário</div>
            <div className="pm-sub">Vence em 3 dias úteis</div>
          </div>
        </div>
      </div>

      {payment === 'card' && (
        <>
          <div className="field-row">
            <div className="field">
              <label>Número do cartão</label>
              <input placeholder="0000 0000 0000 0000" />
            </div>
            <div className="field">
              <label>Nome impresso</label>
              <input placeholder="Como no cartão" />
            </div>
          </div>
          <div className="field-row three">
            <div className="field">
              <label>Validade</label>
              <input placeholder="MM/AA" />
            </div>
            <div className="field">
              <label>CVV</label>
              <input placeholder="000" />
            </div>
            <div className="field">
              <label>Parcelas</label>
              <select>
                {Array.from({ length: INSTALLMENTS_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n}>
                    {n}× de {formatPrice(total / n)} sem juros
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
      {payment === 'pix' && (
        <div style={{ background: 'var(--gold-100)', padding: '20px', borderRadius: 'var(--radius)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 60, height: 60, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--burgundy-900)' }}>
            <Icon name="pix" size={32} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--burgundy-900)', marginBottom: 4 }}>Você receberá o QR Code após confirmar</div>
            <div style={{ fontSize: 13, color: 'var(--ink-700)' }}>O pagamento é confirmado em segundos e sua peça é reservada imediatamente.</div>
          </div>
        </div>
      )}
      {payment === 'boleto' && (
        <div style={{ background: 'var(--cream)', padding: '20px', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--ink-700)' }}>
          O boleto será gerado após a confirmação. Prazo de compensação de até 3 dias úteis. Sua peça fica reservada durante esse período.
        </div>
      )}

      <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={onBack}>
        <Icon name="chevron-left" size={14} /> Voltar
      </button>
    </div>
  );
}

function ConfirmacaoPanel({ orderNumber }) {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '48px 0' }}>
      <div
        style={{
          width: 88, height: 88, borderRadius: '50%', background: 'var(--gold-100)', color: 'var(--success)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        }}
      >
        <Icon name="check" size={44} />
      </div>
      <h1 className="h1">Pedido confirmado!</h1>
      <p className="lede" style={{ margin: '16px 0 8px' }}>
        Seu número de pedido é <b>{orderNumber}</b>.
      </p>
      <p style={{ color: 'var(--ink-700)', marginBottom: 32 }}>
        Enviamos os detalhes para o seu e-mail. O Dr. Sergio e sua equipe começam agora a preparar sua peça com todo o
        cuidado de sempre.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/catalogo" className="btn btn-primary btn-lg">
          Continuar explorando
        </Link>
        <Link href="/" className="btn btn-ghost btn-lg">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorText({ children }) {
  return <span style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{children}</span>;
}
