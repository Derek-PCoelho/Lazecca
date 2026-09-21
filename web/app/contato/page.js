'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { CONTACT } from '@/lib/config';

// Recriado literalmente de design_files/contact.html
// Fase 8: onSubmit agora persiste a mensagem em ContactMessage (banco real) e
// dispara e-mail de notificação (lib/mail.js) — substitui o comportamento
// anterior, que só trocava para uma tela de confirmação local sem persistência.
export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Dúvida sobre uma peça', message: '' });

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível enviar sua mensagem. Tente novamente.');
        return;
      }
      setSent(true);
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header page="contact" />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Contato</span>
          </div>
          <h1 className="h1">Fale conosco</h1>
          <p className="lede">Dúvidas sobre uma peça, avaliação de coleção ou apenas uma conversa sobre numismática — é sempre um prazer.</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          {/* Info */}
          <div>
            <div className="contact-info-card">
              <h3>Canais Diretos</h3>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="cm-icon">
                    <Icon name="phone" size={20} />
                  </div>
                  <div>
                    <div className="cm-label">Telefone</div>
                    <div className="cm-value">
                      <a href={CONTACT.phoneHref}>+55 {CONTACT.phoneDisplay}</a>
                    </div>
                    <div className="cm-sub">Seg à Sex · 09h às 16h (horário de Brasília)</div>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="cm-icon">
                    <Icon name="mail" size={20} />
                  </div>
                  <div>
                    <div className="cm-label">E-mail</div>
                    <div className="cm-value">
                      <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                    </div>
                    <div className="cm-sub">Resposta em até 24 horas úteis</div>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="cm-icon">
                    <Icon name="map-pin" size={20} />
                  </div>
                  <div>
                    <div className="cm-label">Endereço</div>
                    <div className="cm-value">{CONTACT.address}</div>
                    <div className="cm-sub">Centro · Fortaleza/CE · CEP 60055-120</div>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="cm-icon">
                    <Icon name="clock" size={20} />
                  </div>
                  <div>
                    <div className="cm-label">Horário</div>
                    <div className="cm-value">{CONTACT.hours}</div>
                    <div className="cm-sub">Visitas com hora marcada · Sábados por consulta</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="whatsapp-card">
              <div className="wa-icon">
                <Icon name="whatsapp" size={30} />
              </div>
              <div style={{ flex: 1 }}>
                <h4>Prefere WhatsApp?</h4>
                <p>Atendimento rápido, sem filas, das 10h às 20h todos os dias.</p>
              </div>
              <a href={CONTACT.whatsappHref} className="btn btn-gold btn-sm">
                Conversar
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-card">
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div
                  style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'var(--gold-100)', color: 'var(--success)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                  }}
                >
                  <Icon name="check" size={40} />
                </div>
                <h2 style={{ marginBottom: 12 }}>Mensagem recebida!</h2>
                <p style={{ color: 'var(--ink-700)', fontSize: 16, lineHeight: 1.6 }}>
                  Obrigado por escrever. O Dr. Sergio responderá em até 24 horas úteis. Se for urgente, ligue no{' '}
                  <b>{CONTACT.phoneDisplay}</b> ou fale no WhatsApp.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: '', email: '', phone: '', subject: 'Dúvida sobre uma peça', message: '' });
                  }}
                  className="btn btn-ghost"
                  style={{ marginTop: 24 }}
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <>
                <h2>Deixe sua mensagem</h2>
                <p>Preencha o formulário abaixo e responderemos com atenção.</p>
                <form onSubmit={onSubmit}>
                  <div className="form-grid">
                    <div className="field">
                      <label>Seu nome</label>
                      <input required placeholder="Nome completo" value={form.name} onChange={setField('name')} />
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input required type="email" placeholder="voce@email.com.br" value={form.email} onChange={setField('email')} />
                    </div>
                    <div className="field">
                      <label>Telefone</label>
                      <input placeholder="(00) 00000-0000" value={form.phone} onChange={setField('phone')} />
                    </div>
                    <div className="field">
                      <label>Assunto</label>
                      <select value={form.subject} onChange={setField('subject')}>
                        <option>Dúvida sobre uma peça</option>
                        <option>Avaliação de coleção</option>
                        <option>Consignação para venda</option>
                        <option>Autenticação externa</option>
                        <option>Sugestão / Elogio</option>
                        <option>Outro</option>
                      </select>
                    </div>
                    <div className="field full">
                      <label>Mensagem</label>
                      <textarea rows="6" placeholder="Conte-nos como podemos ajudar..." required value={form.message} onChange={setField('message')}></textarea>
                    </div>
                    <div className="full" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-500)' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: 'var(--burgundy-700)' }} />
                      <span>
                        Aceito o tratamento dos meus dados conforme a{' '}
                        <Link href="/politica-de-privacidade" style={{ color: 'var(--burgundy-700)' }}>
                          Política de Privacidade
                        </Link>
                      </span>
                    </div>
                    {error && (
                      <div className="full" style={{ color: 'var(--danger)', fontSize: 13 }}>
                        {error}
                      </div>
                    )}
                    <div className="full" style={{ marginTop: 16 }}>
                      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={sending}>
                        {sending ? 'Enviando...' : 'Enviar Mensagem'} <Icon name="chevron-right" size={14} />
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Mapa — Correção (auditoria pós-lançamento): antes era um placeholder
            estático (CSS decorativo, sem mapa real). Agora é um embed real do
            Google Maps centrado no endereço da loja, com um link "Abrir no Google
            Maps" para rotas/navegação — sem precisar de chave de API paga. */}
        <div className="map-block map-block-real">
          <iframe
            title="Localização da La Zecca Numismática no Google Maps"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(CONTACT.addressFull)}&z=16&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.addressFull)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-open-link"
          >
            <Icon name="map-pin" size={14} /> Abrir no Google Maps
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}
