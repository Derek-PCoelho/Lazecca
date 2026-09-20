'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';

// Recriado literalmente de design_files/authenticity.html
const faqs = [
  { q: 'Como sei que a peça é autêntica?', a: 'Toda peça em nosso acervo passa por análise técnica em quatro etapas — pesagem de precisão, medição, análise metalográfica quando necessária e comparação com catálogos oficiais. Emitimos certificado próprio numerado e, para peças acima de R$ 5.000, recomendamos e facilitamos análise adicional pelo IBN (Instituto Brasileiro de Numismática).' },
  { q: 'O certificado La Zecca tem valor de mercado?', a: 'Sim. Nossa certificação é reconhecida em leilões numismáticos brasileiros e por casas parceiras. O código do certificado é único e pode ser verificado a qualquer momento em nossa base de dados.' },
  { q: 'E se a peça apresentar problema após a compra?', a: 'Nós garantimos autenticidade por prazo indeterminado. Se em qualquer momento uma peça for questionada, faremos reanálise gratuita e, se comprovado defeito ou inautenticidade, restituímos integralmente o valor pago.' },
  { q: 'Posso devolver uma peça se mudar de ideia?', a: 'Sim. Você tem 7 dias corridos após o recebimento para devolução sem justificativa, conforme o Código de Defesa do Consumidor. A peça deve retornar em suas condições originais, com o certificado e a embalagem.' },
  { q: 'Como é feito o envio?', a: 'Enviamos em embalagem sigilosa, acolchoada e com seguro total contra perdas ou danos. Utilizamos Sedex, PAC e transportadoras especializadas em cargas de alto valor. Para peças acima de R$ 10.000, oferecemos entrega em mãos em capitais.' },
  { q: 'Vocês compram ou avaliam coleções?', a: 'Sim. Realizamos avaliação de coleções para venda direta, consignação ou herança. Entre em contato pelo formulário ou por telefone — o próprio Dr. Sergio conduz as avaliações mais significativas.' },
];

export default function AuthenticityClient() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <Header page="auth" />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Autenticidade & Garantias</span>
          </div>
          <h1 className="h1">Autenticidade acima de tudo</h1>
          <p className="lede">
            O que faz uma peça ser <em>de verdade</em>? Nosso método, nossos certificados, nossas garantias —
            descritos sem letras miúdas.
          </p>
        </div>
      </section>

      {/* Processo */}
      <section>
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-title">
              <span className="eyebrow">Nosso Processo</span>
              <h2 className="h2">Quatro etapas antes de qualquer peça entrar no catálogo</h2>
            </div>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <div className="step-num">1</div>
              <div style={{ color: 'var(--burgundy-700)' }}>
                <Icon name="lens" size={36} />
              </div>
              <h3>Aquisição</h3>
              <p>Compramos apenas de fontes com procedência documentada: colecionadores estabelecidos, herdeiros identificados e leilões reconhecidos.</p>
            </div>
            <div className="process-step">
              <div className="step-num">2</div>
              <div style={{ color: 'var(--burgundy-700)' }}>
                <Icon name="shield" size={36} />
              </div>
              <h3>Análise Técnica</h3>
              <p>Pesagem em balança de precisão, medição com paquímetro, teste de densidade para metais preciosos, análise sob luz UV e comparação com padrões.</p>
            </div>
            <div className="process-step">
              <div className="step-num">3</div>
              <div style={{ color: 'var(--burgundy-700)' }}>
                <Icon name="award" size={36} />
              </div>
              <h3>Atribuição & Catálogo</h3>
              <p>Cruzamento com catálogos internacionais (Krause, Amato, Silveira). Atribuição de referência bibliográfica e classificação de raridade.</p>
            </div>
            <div className="process-step">
              <div className="step-num">4</div>
              <div style={{ color: 'var(--burgundy-700)' }}>
                <Icon name="check" size={36} />
              </div>
              <h3>Certificação</h3>
              <p>Emissão de certificado impresso numerado, com foto, descrição técnica, atribuição bibliográfica e assinatura do curador.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificado showcase */}
      <section className="bg-cream">
        <div className="container">
          <div className="certificate-showcase">
            <div style={{ position: 'relative' }}>
              <div className="certificate-visual">
                <div className="cert-code-badge">Nº 00847</div>
                <div className="cert-emblem">
                  <Image src="/assets/logo-emblem.png" alt="" width={80} height={80} style={{ objectFit: 'cover' }} />
                </div>
                <div className="cert-title">Certificado de Autenticidade</div>
                <div className="cert-subtitle">La Zecca Numismática · Emitido em Fortaleza/CE</div>
                <div className="cert-body">
                  <p>
                    Certificamos que a peça descrita abaixo foi submetida ao processo curatorial da La Zecca e é
                    declarada <strong>autêntica</strong> em todas as suas características constitutivas.
                  </p>
                  <p style={{ marginTop: 16, fontSize: 14 }}>
                    <b>20.000 Réis Ouro</b>
                    <br />
                    Império do Brasil · 1889
                    <br />
                    Estado: Flor de Cunho
                  </p>
                </div>
                <div className="cert-signature">Dr. Sergio Costa</div>
                <div className="cert-footer">
                  <span>Emitido em 12/03/2026</span>
                  <span>Válido indeterminadamente</span>
                </div>
                <div className="cert-wax">LZ</div>
              </div>
            </div>
            <div>
              <span className="eyebrow">O Certificado</span>
              <h2 className="h2" style={{ marginTop: 12, marginBottom: 20 }}>Um documento, uma promessa</h2>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-700)', marginBottom: 20 }}>
                Cada peça em nosso catálogo é acompanhada de um certificado físico impresso em papel timbrado de
                250g, numerado, assinado à mão e selado com lacre de cera.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-700)', marginBottom: 32 }}>
                O documento contém a descrição técnica completa, atribuição bibliográfica, grau de conservação e o
                código único que pode ser verificado em nossa base a qualquer momento.
              </p>
              <Link href="/catalogo" className="btn btn-primary btn-lg">
                Explorar o acervo certificado
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Garantias */}
      <section>
        <div className="container-narrow">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-title">
              <span className="eyebrow">Nossas Garantias</span>
              <h2 className="h2">Cinco compromissos, por escrito</h2>
            </div>
          </div>
          <div className="guarantee-list">
            <div className="guarantee-item">
              <div className="g-icon">
                <Icon name="shield" size={22} />
              </div>
              <div>
                <h4>Garantia de Autenticidade Vitalícia</h4>
                <p>Se em qualquer momento uma peça adquirida na La Zecca for comprovadamente inautêntica, restituímos integralmente o valor pago, corrigido monetariamente.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <div className="g-icon">
                <Icon name="refresh" size={22} />
              </div>
              <div>
                <h4>7 Dias para Arrependimento</h4>
                <p>Direito de devolução sem justificativa, conforme o Código de Defesa do Consumidor. Basta devolver a peça em suas condições originais.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <div className="g-icon">
                <Icon name="truck" size={22} />
              </div>
              <div>
                <h4>Seguro Total no Transporte</h4>
                <p>Todas as encomendas viajam com seguro contra perdas, danos e extravio. Você é ressarcido do valor integral em caso de sinistro.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <div className="g-icon">
                <Icon name="award" size={22} />
              </div>
              <div>
                <h4>Preço Justo e Transparente</h4>
                <p>Nossos preços seguem as tabelas oficiais do IBN e valores de leilão recentes. Compare, questione, negocie — a discussão faz parte do ofício.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <div className="g-icon">
                <Icon name="user" size={22} />
              </div>
              <div>
                <h4>Curadoria Sempre à Disposição</h4>
                <p>Antes ou depois da compra, você pode consultar o Dr. Sergio e sua equipe por e-mail, telefone ou WhatsApp. Sem pressa, sem taxa.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream">
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-title">
              <span className="eyebrow">Perguntas Frequentes</span>
              <h2 className="h2">Dúvidas honestas, respostas honestas</h2>
            </div>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <h4>{f.q}</h4>
                  <span className="chev">
                    <Icon name="chevron-down" size={20} />
                  </span>
                </div>
                <div className="faq-answer">
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
