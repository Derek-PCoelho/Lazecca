import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { CONTACT } from '@/lib/config';

export const metadata = {
  title: 'Sobre',
  description: 'A história da La Zecca e do Dr. Sergio Costa — 27 anos de curadoria numismática em Fortaleza/CE.',
};

// Recriado literalmente de design_files/about.html
// Melhoria 9: CSS morto .team-grid / .team-card removido de globals.css — não há seção
// "Equipe" com outros nomes; único membro exibido é o Dr. Sergio Costa (README, item importante).
export default function SobrePage() {
  return (
    <>
      <Header page="about" />

      {/* Hero */}
      <section className="container">
        <div className="about-hero">
          <div>
            <div className="about-portrait">
              <Image src="/assets/dr-sergio-portrait.png" alt="Dr. Sergio Costa" width={440} height={587} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div className="about-hero-copy">
            <span className="eyebrow">Nossa História · Desde 1998</span>
            <h1>
              De um pequeno acervo particular ao maior <em>caderno de curadoria</em> numismática do Brasil.
            </h1>
            <p className="lede" style={{ maxWidth: 'none', margin: 0 }}>
              A La Zecca nasceu na sala de casa. Um único armário de vidro, três dezenas de moedas herdadas do avô
              e a promessa de nunca vender uma peça sem antes conhecê-la a fundo.
            </p>
            <p style={{ marginTop: 16, color: 'var(--ink-700)' }}>
              Vinte e sete anos depois, esse compromisso permanece. Hoje somos uma equipe pequena, obstinada, que
              atende colecionadores em todo o Brasil e mantém, na Rua do Pocinho, no Centro de Fortaleza, uma sala
              aberta a quem quiser conversar sobre uma peça em particular.
            </p>
            <div className="signature-block">
              <div className="signature">Dr. Sergio Costa</div>
              <div className="signature-role">Fundador · Curador-Chefe</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="container">
        <div className="stats-strip">
          <div>
            <div className="num">27</div>
            <div className="lbl">Anos de Ofício</div>
          </div>
          <div className="divider">
            <div className="num">2.400+</div>
            <div className="lbl">Peças Curadas</div>
          </div>
          <div className="divider">
            <div className="num">1.200+</div>
            <div className="lbl">Colecionadores</div>
          </div>
          <div className="divider">
            <div className="num">4,9★</div>
            <div className="lbl">Nossa Avaliação</div>
          </div>
        </div>
      </div>

      {/* Manifesto */}
      <section className="bg-cream">
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Nosso Manifesto</span>
          <h2 className="h1" style={{ marginTop: 12, marginBottom: 32 }}>
            Colecionar é preservar.
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--ink-700)', maxWidth: 720, margin: '0 auto' }}>
            Cada moeda que atravessou séculos escapou de fundições, guerras, esquecimentos. Chegar ao presente é,
            para uma peça, um pequeno milagre. Cuidar dela é uma responsabilidade — e um privilégio.
          </p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.7, color: 'var(--ink-700)', margin: '24px auto 0', maxWidth: 640 }}>
            Não somos apenas uma loja. Somos uma comunidade de guardiões temporários dessas pequenas obras de arte
            utilitária. Aqui, cada peça é apresentada com contexto histórico, atribuição rigorosa e o cuidado que
            500 anos de história merecem.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-title">
              <span className="eyebrow">Nossa Trajetória</span>
              <h2 className="h2">Cinco décadas em cinco marcos</h2>
            </div>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <span className="dot"></span>
              <span className="year">1998</span>
              <div>
                <h4>Uma sala, um armário, uma paixão</h4>
                <p>Dr. Sergio Costa organiza o acervo herdado do avô e inicia trocas com colecionadores locais. Nasce, informalmente, a La Zecca.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="dot"></span>
              <span className="year">2004</span>
              <div>
                <h4>Primeira loja física em Fortaleza</h4>
                <p>Abertura do escritório de curadoria na Rua do Pocinho, no Centro Histórico da capital cearense. Consultoria para colecionadores privados começa a se estruturar.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="dot"></span>
              <span className="year">2011</span>
              <div>
                <h4>Parceria com a Sociedade Numismática Brasileira</h4>
                <p>Passamos a integrar o comitê de autenticação. Iniciamos a emissão dos certificados La Zecca, hoje reconhecidos em todo o país.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="dot"></span>
              <span className="year">2019</span>
              <div>
                <h4>Lazecca.com.br vai ao ar</h4>
                <p>A loja virtual atende, no primeiro ano, colecionadores em 22 estados. O canal digital preserva o rigor curatorial do atendimento presencial.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="dot"></span>
              <span className="year">2026</span>
              <div>
                <h4>Nova identidade, mesma essência</h4>
                <p>Renovamos nosso emblema e nosso diário digital, reafirmando o compromisso com a curadoria e a educação numismática.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-cream">
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-title">
              <span className="eyebrow">O que nos guia</span>
              <h2 className="h2">Três princípios inegociáveis</h2>
            </div>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="v-icon">
                <Icon name="shield" size={30} />
              </div>
              <h3>Autenticidade Absoluta</h3>
              <p>Toda peça é examinada, pesada, medida e cruzada com catálogos internacionais. Emitimos certificado próprio e recomendamos análise externa quando necessário.</p>
            </div>
            <div className="value-card">
              <div className="v-icon">
                <Icon name="award" size={30} />
              </div>
              <h3>Curadoria Ativa</h3>
              <p>Rejeitamos mais peças do que aceitamos. Nossa reputação depende do que decidimos não colocar no acervo — e cada exemplar recebe uma pequena ficha de história.</p>
            </div>
            <div className="value-card">
              <div className="v-icon">
                <Icon name="sparkles" size={30} />
              </div>
              <h3>Educação Numismática</h3>
              <p>Colecionar bem depende de saber. Publicamos guias, respondemos dúvidas por escrito, e conversamos com paciência com quem está começando.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-burgundy" style={{ textAlign: 'center' }}>
        <div className="container-narrow">
          <span className="eyebrow" style={{ color: 'var(--gold-600)' }}>Vender ou avaliar sua coleção</span>
          <h2 className="h2" style={{ color: 'var(--gold-500)', marginTop: 12, marginBottom: 16 }}>Recebemos peças em consignação</h2>
          <p style={{ color: 'var(--parchment)', fontSize: 18, lineHeight: 1.6, maxWidth: 560, margin: '0 auto 32px' }}>
            Se você herdou ou construiu uma coleção e deseja vendê-la com curadoria, avaliação transparente e
            comissão justa, converse com a gente.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contato" className="btn btn-gold btn-lg">
              Falar com o Dr. Sergio
            </Link>
            <a href={CONTACT.phoneHref} className="btn btn-outline btn-lg" style={{ color: 'var(--gold-500)', borderColor: 'var(--gold-700)' }}>
              <Icon name="phone" size={16} /> {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
