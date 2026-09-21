'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/Icon';
import { formatPrice } from '@/lib/data';
import { getCartItems, CART_CHANGED_EVENT } from '@/lib/cart';
import { PIX_DISCOUNT_RATE, INSTALLMENTS_MAX } from '@/lib/config';
import { validateCpf, validateEmail, validatePhone, validateCepFormat, formatCpf, formatPhone, formatCep } from '@/lib/validation';

// Recriado literalmente de design_files/checkout.html
// Melhoria 5: REMOVIDO o useEffect que auto-preenchia p001/p004 quando o carrinho estava vazio.
// Melhoria 2: navegação real por estado entre as 4 etapas (antes exibidas simultaneamente),
//   com validação básica de campos obrigatórios por etapa e ação real (simulada) no botão
//   "Concluir Pedido" — gera número de pedido e mostra tela de confirmação.
// Bloco 1 (auditoria pós-lançamento): o frete deixou de usar a tabela fixa local
//   (getShippingPrice/SHIPPING_METHODS) — agora é calculado de fato chamando
//   /api/shipping/calculate (que usa Melhor Envio quando configurado, ou a tabela
//   de fallback no servidor) no momento em que o CEP é confirmado, exibindo preço
//   e prazo reais antes da confirmação do pedido.
// Nota de arquitetura: o pedido é processado via API route real (/api/orders), que
// recalcula preço/frete/desconto inteiramente no servidor a partir do banco — o
// valor exibido aqui é sempre uma prévia, nunca a fonte de verdade do cobrado.

// Formatação automática (Bloco 6) enquanto o usuário digita: aceita com ou
// sem pontuação, mas exibe sempre formatado no campo.
const FIELD_FORMATTERS = { cpf: formatCpf, telefone: formatPhone, cep: formatCep };

const STEPS = [
  { key: 'identificacao', num: 1, label: 'Identificação & Entrega' },
  { key: 'pagamento', num: 2, label: 'Pagamento' },
  { key: 'confirmacao', num: 3, label: 'Confirmação' },
];

export default function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [step, setStep] = useState('identificacao');
  const [payment, setPayment] = useState('pix');
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
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
  const selectedShipping = shippingOptions.find((o) => o.id === shippingMethod);
  const shipping = selectedShipping ? selectedShipping.price : 0;
  const discount = payment === 'pix' ? subtotal * PIX_DISCOUNT_RATE : 0;
  const total = subtotal + shipping - discount;

  // Formatação automática (Bloco 6) enquanto o usuário digita: aceita com ou
  // sem pontuação, mas exibe sempre formatado no campo.
  const setField = (field) => (e) => {
    const formatter = FIELD_FORMATTERS[field];
    const value = formatter ? formatter(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Bloco 1: calcula o frete REAL (via /api/shipping/calculate) a partir do CEP
  // informado e do peso real dos itens do carrinho — chamado quando o cliente
  // confirma o endereço (transição Identificação -> Pagamento).
  const fetchShippingOptions = async () => {
    setShippingLoading(true);
    setShippingError('');
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep: form.cep,
          subtotal,
          items: items.map((i) => ({ weightGrams: i.product.weightGrams, quantity: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.options) || data.options.length === 0) {
        setShippingError(data.error || 'Não foi possível calcular o frete para este CEP.');
        setShippingOptions([]);
        return false;
      }
      setShippingOptions(data.options);
      // Mantém a seleção atual se ainda existir entre as novas opções; senão usa a primeira
      setShippingMethod((current) => (data.options.some((o) => o.id === current) ? current : data.options[0].id));
      return true;
    } catch (err) {
      setShippingError('Erro de conexão ao calcular o frete. Tente novamente.');
      setShippingOptions([]);
      return false;
    } finally {
      setShippingLoading(false);
    }
  };

  const validateIdentificacao = () => {
    const errs = {};
    if (!form.nome.trim()) {
      errs.nome = 'Informe seu nome completo';
    } else if (/^\d+$/.test(form.nome.replace(/\s+/g, ''))) {
      errs.nome = 'Nome não pode conter apenas números';
    }

    if (!form.cpf.trim()) {
      errs.cpf = 'Informe seu CPF';
    } else {
      const cpfCheck = validateCpf(form.cpf);
      if (!cpfCheck.valid) errs.cpf = cpfCheck.reason;
    }

    if (!form.email.trim()) {
      errs.email = 'Informe seu e-mail';
    } else {
      const emailCheck = validateEmail(form.email);
      if (!emailCheck.valid) errs.email = emailCheck.reason;
    }

    if (!form.telefone.trim()) {
      errs.telefone = 'Informe seu telefone';
    } else {
      const phoneCheck = validatePhone(form.telefone);
      if (!phoneCheck.valid) errs.telefone = phoneCheck.reason;
    }

    if (!form.cep.trim()) {
      errs.cep = 'Informe o CEP';
    } else {
      const cepCheck = validateCepFormat(form.cep);
      if (!cepCheck.valid) errs.cep = cepCheck.reason;
    }
    if (!form.rua.trim()) errs.rua = 'Informe a rua';
    if (!form.numero.trim()) errs.numero = 'Informe o número';
    if (!form.bairro.trim()) errs.bairro = 'Informe o bairro';
    if (!form.cidade.trim()) errs.cidade = 'Informe a cidade';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToPagamento = async () => {
    if (!validateIdentificacao()) return;
    const ok = await fetchShippingOptions();
    if (ok) setStep('pagamento');
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
                  <IdentificacaoPanel
                    form={form}
                    setField={setField}
                    errors={errors}
                    onNext={goToPagamento}
                    shippingLoading={shippingLoading}
                    shippingError={shippingError}
                  />
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
                    O frete real será calculado pelo CEP informado ao avançar para o pagamento.
                  </div>
                ) : (
                  <>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label>Modalidade de envio</label>
                      {shippingOptions.length > 0 ? (
                        <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                          {shippingOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name} · {o.days} · {o.price === 0 ? 'Grátis' : formatPrice(o.price)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--danger)' }}>
                          {shippingError || 'Não foi possível calcular o frete.'}
                        </div>
                      )}
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
                      disabled={submitting || shippingOptions.length === 0}
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

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function IdentificacaoPanel({ form, setField, errors, onNext, shippingLoading, shippingError }) {
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
              {BR_STATES.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
        {shippingError && <ErrorText>{shippingError}</ErrorText>}
        <button className="btn btn-primary btn-lg" style={{ marginTop: 8 }} onClick={onNext} disabled={shippingLoading}>
          {shippingLoading ? 'Calculando frete...' : 'Continuar para Pagamento'}{' '}
          {!shippingLoading && <Icon name="chevron-right" size={16} />}
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
