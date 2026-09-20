'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { CONTACT } from '@/lib/config';

// Recriado literalmente de design_files/contact.html
// Nota (seção 5/7 do megaprompt): o onSubmit já era funcional no protótipo — apenas
// troca o formulário por uma tela de confirmação local via useState, sem chamada de
// rede/e-mail/persistência real. A Melhoria 11 (envio real por trás deste onSubmit)
// fica explicitamente FORA do escopo deste ciclo de créditos (Fase Futura, item 11) —
// o onSubmit abaixo é preservado como estava, apenas adaptado à sintaxe Next.js.
export default function ContactPage() {
  const [sent, setSent] = useState(false);

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
                <button onClick={() => setSent(false)} className="btn btn-ghost" style={{ marginTop: 24 }}>
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <>
                <h2>Deixe sua mensagem</h2>
                <p>Preencha o formulário abaixo e responderemos com atenção.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <div className="form-grid">
                    <div className="field">
                      <label>Seu nome</label>
                      <input required placeholder="Nome completo" />
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input required type="email" placeholder="voce@email.com.br" />
                    </div>
                    <div className="field">
                      <label>Telefone</label>
                      <input placeholder="(00) 00000-0000" />
                    </div>
                    <div className="field">
                      <label>Assunto</label>
                      <select>
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
                      <textarea rows="6" placeholder="Conte-nos como podemos ajudar..." required></textarea>
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
                    <div className="full" style={{ marginTop: 16 }}>
                      <button type="submit" className="btn btn-primary btn-lg btn-block">
                        Enviar Mensagem <Icon name="chevron-right" size={14} />
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="map-block">
          <div className="map-pin">
            <Icon name="map-pin" size={20} />
          </div>
          <div className="map-label">
            <h4>La Zecca Numismática</h4>
            <p>{CONTACT.addressFull}</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
