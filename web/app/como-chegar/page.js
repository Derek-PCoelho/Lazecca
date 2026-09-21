import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { CONTACT } from '@/lib/config';

// =============================================================================
// Página "Como Chegar"
// =============================================================================
// Antes, a única forma de ver a localização da loja era rolar até o final da
// página de Contato — o mapa ficava "escondido" abaixo do formulário e dos
// canais de atendimento. Esta página dá destaque exclusivo à localização
// (mapa grande, endereço, pontos de referência, como chegar de carro/a pé/
// transporte público e estacionamento), e ganhou um item próprio na barra de
// navegação (desktop + drawer mobile, ver components/Header.js) para ficar
// visível e acessível em 1 clique a partir de qualquer página do site.
// =============================================================================

export const metadata = {
  title: 'Como Chegar · Loja em Fortaleza/CE',
  description: 'Como chegar à La Zecca Numismática, no Centro de Fortaleza/CE — endereço, mapa, pontos de referência e opções de estacionamento para visitar nossa loja de cédulas e moedas antigas.',
  alternates: { canonical: '/como-chegar' },
  openGraph: {
    title: 'Como Chegar à La Zecca Numismática (Centro de Fortaleza/CE)',
    description: 'Endereço, mapa, pontos de referência e estacionamento para visitar a loja da La Zecca Numismática no Centro de Fortaleza/CE.',
    url: '/como-chegar',
  },
};

const REFERENCE_POINTS = [
  {
    icon: 'map-pin',
    title: 'Praça do Ferreira',
    text: 'A cerca de 2 minutos a pé — o principal ponto de referência do Centro de Fortaleza.',
  },
  {
    icon: 'map-pin',
    title: 'Catedral Metropolitana',
    text: 'A poucos quarteirões, na mesma região histórica do Centro.',
  },
  {
    icon: 'truck',
    title: 'Estação José de Alencar (Metrofor)',
    text: 'A estação de metrô/VLT mais próxima, a curta distância a pé do endereço.',
  },
  {
    icon: 'shield',
    title: 'Shopping Metrô',
    text: 'Ponto conhecido nas proximidades, útil como referência para motoristas de app.',
  },
];

const HOW_TO_ARRIVE = [
  {
    icon: 'truck',
    title: 'De carro',
    text: 'O Centro de Fortaleza tem ruas estreitas e trânsito intenso em dias úteis. Recomendamos usar um aplicativo de mapas (Google Maps ou Waze) com o endereço completo e considerar estacionamentos pagos nas proximidades — vagas na rua são escassas durante o horário comercial.',
  },
  {
    icon: 'award',
    title: 'De transporte por aplicativo ou táxi',
    text: 'A forma mais prática de chegar ao Centro. Informe ao motorista o endereço completo (R. do Pocinho, 33 — Sala 425) ou compartilhe o link do Google Maps abaixo diretamente no app.',
  },
  {
    icon: 'sliders',
    title: 'De metrô/VLT (Metrofor)',
    text: 'Desça na Estação José de Alencar e siga a pé por cerca de 5 minutos em direção à Praça do Ferreira — uma ótima opção para evitar o trânsito e a dificuldade de estacionamento do Centro.',
  },
  {
    icon: 'clock',
    title: 'Horário de atendimento',
    text: `${CONTACT.hours}. Visitas à loja física são feitas com hora marcada — recomendamos ligar ou chamar no WhatsApp antes de se deslocar, para garantir que o Dr. Sergio ou um especialista esteja disponível para te atender.`,
  },
];

export default function ComoChegarPage() {
  return (
    <>
      <Header page="como-chegar" />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Como Chegar</span>
          </div>
          <h1 className="h1">Como chegar à La Zecca</h1>
          <p className="lede">
            Estamos no coração histórico do Centro de Fortaleza — veja o mapa, o endereço completo e as
            melhores formas de chegar até a nossa loja.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="como-chegar-grid">
            {/* Mapa em destaque */}
            <div>
              <div
                className="map-block map-block-real"
                style={{ marginTop: 0, aspectRatio: '4/3' }}
              >
                <iframe
                  title="Localização da La Zecca Numismática no Google Maps"
                  src={`https://maps.google.com/maps?q=${CONTACT.lat},${CONTACT.lng}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                />
              </div>
              {/* Correção: o link "Abrir no Google Maps" era um botão flutuante
                  (position:absolute) por cima do mapa, cobrindo parte do
                  conteúdo em telas estreitas. Agora fica logo abaixo do quadro
                  do mapa, sem sobrepor nada. */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.addressFull)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-open-link"
              >
                <Icon name="map-pin" size={14} /> Abrir no Google Maps
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONTACT.addressFull)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ marginTop: 20, width: '100%', textAlign: 'center', justifyContent: 'center' }}
              >
                <Icon name="map-pin" size={16} /> Traçar rota até a loja
              </a>
            </div>

            {/* Endereço + contato rápido */}
            <div className="contact-info-card">
              <h3>Endereço</h3>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="cm-icon">
                    <Icon name="map-pin" size={20} />
                  </div>
                  <div>
                    <div className="cm-label">La Zecca Numismática</div>
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
                <div className="contact-method">
                  <div className="cm-icon">
                    <Icon name="phone" size={20} />
                  </div>
                  <div>
                    <div className="cm-label">Telefone / WhatsApp</div>
                    <div className="cm-value">
                      <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                        +55 {CONTACT.phoneDisplay}
                      </a>
                    </div>
                    <div className="cm-sub">Combine sua visita antes de vir até a loja</div>
                  </div>
                </div>
              </div>
              <div className="whatsapp-card" style={{ marginTop: 20 }}>
                <div className="wa-icon">
                  <Icon name="whatsapp" size={30} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4>Confirme sua visita</h4>
                  <p>Fale com a gente no WhatsApp antes de vir — garantimos que alguém da equipe estará disponível.</p>
                </div>
                <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm">
                  Conversar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pontos de referência */}
      <section className="bg-cream">
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-title">
              <span className="eyebrow">Nas proximidades</span>
              <h2 className="h2">Pontos de referência</h2>
            </div>
          </div>
          <div className="process-grid">
            {REFERENCE_POINTS.map((p) => (
              <div className="process-step" key={p.title} style={{ paddingTop: 40 }}>
                <div style={{ color: 'var(--burgundy-700)', marginBottom: 8 }}>
                  <Icon name={p.icon} size={32} />
                </div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como chegar (modalidades) */}
      <section>
        <div className="container-narrow">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-title">
              <span className="eyebrow">Modalidades</span>
              <h2 className="h2">Formas de chegar até a loja</h2>
            </div>
          </div>
          <div className="guarantee-list">
            {HOW_TO_ARRIVE.map((item) => (
              <div className="guarantee-item" key={item.title}>
                <div className="g-icon">
                  <Icon name={item.icon} size={22} />
                </div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-burgundy" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-600)' }}>Ainda com dúvidas?</span>
          <h2 className="h1" style={{ color: 'var(--gold-500)', marginTop: 12 }}>
            Fale com a gente antes de vir
          </h2>
          <p style={{ color: 'var(--parchment)', fontStyle: 'italic', marginTop: 12, maxWidth: 640, marginInline: 'auto' }}>
            Prefere combinar por telefone, e-mail ou o formulário de contato? Todos os canais estão reunidos na
            nossa página de contato.
          </p>
          <Link href="/contato" className="btn btn-gold" style={{ marginTop: 28 }}>
            Ir para Contato
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
