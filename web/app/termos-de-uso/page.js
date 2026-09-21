import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CONTACT } from '@/lib/config';

// =============================================================================
// Bloco 7 — Termos de Uso
// =============================================================================
// Conteúdo real, substituindo o placeholder anterior "Em construção".
// Reflete o comportamento real implementado no sistema: peças usadas/únicas
// (não novas de fábrica), direito de arrependimento de 7 dias corridos
// conforme Art. 49 do CDC (mesmo prazo aplicado em app/api/orders/[id]/cancel),
// frete calculado em tempo real, desconto de 5% no PIX, e formas de pagamento
// (PIX/cartão/boleto) — sem inventar cláusulas que o sistema não implementa.
//
// Não substitui revisão jurídica formal — recomenda-se que um advogado do
// cliente revise antes da publicação definitiva, especialmente quanto à
// razão social/CNPJ (ainda não formalizados no sistema).
// =============================================================================

export const metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso que regem a navegação e as compras realizadas no site da La Zecca Numismática.',
};

const SECTION_STYLE = { marginTop: 32 };
const H2_STYLE = { fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--burgundy-900)', marginBottom: 8 };
const P_STYLE = { color: 'var(--ink-500)', marginTop: 8, lineHeight: 1.7 };
const UL_STYLE = { color: 'var(--ink-500)', marginTop: 8, lineHeight: 1.7, paddingLeft: 20 };

export default function TermosDeUsoPage() {
  return (
    <>
      <Header />
      <div className="container" style={{ padding: '64px 0 96px', maxWidth: 760 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--burgundy-900)', marginTop: 8 }}>
          Termos de Uso
        </h1>
        <p style={{ color: 'var(--ink-500)', marginTop: 16, lineHeight: 1.7 }}>
          Última atualização: setembro de 2026. Estes Termos de Uso regem a
          navegação neste site e as compras realizadas na <strong>La Zecca
          Numismática</strong>. Ao criar uma conta, navegar pelo catálogo ou
          finalizar uma compra, você concorda com os termos abaixo.
        </p>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>1. Sobre as peças vendidas</h2>
          <p style={P_STYLE}>
            Todas as cédulas e moedas do nosso acervo são peças <strong>usadas,
            colecionáveis e, em sua maioria, únicas</strong> (não são produtos de
            fábrica com reposição de estoque). Cada peça é fotografada, descrita e
            classificada individualmente (estado de conservação, ano, série,
            defeitos quando existentes) pelo Dr. Sergio Costa e sua equipe, com base
            no exame físico do item.
          </p>
          <p style={P_STYLE}>
            Uma vez vendida, uma peça única não estará mais disponível para
            reposição — por isso, as fichas de peças esgotadas permanecem visíveis
            no site (marcadas como &quot;Esgotado&quot;), apenas como referência histórica e
            de portfólio de curadoria, sem possibilidade de nova compra daquele
            exemplar específico.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>2. Cadastro e conta</h2>
          <p style={P_STYLE}>
            Para comprar no site, é necessário criar uma conta com e-mail e senha.
            Você é responsável por manter a confidencialidade da sua senha e por
            todas as atividades realizadas na sua conta. Informações fornecidas no
            cadastro (nome, CPF, telefone, endereços) devem ser verdadeiras e
            atualizadas — usamos o CPF para identificação em pedidos e emissão de
            nota fiscal.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>3. Preços, frete e formas de pagamento</h2>
          <ul style={UL_STYLE}>
            <li>Os preços exibidos estão em reais (R$) e podem ser alterados sem aviso prévio, até o momento da confirmação do pedido.</li>
            <li>O frete é calculado em tempo real com base no CEP de entrega e no peso das peças do carrinho, exibido antes da confirmação do pedido.</li>
            <li>Pagamentos via PIX têm 5% de desconto sobre o valor total, aplicado automaticamente no checkout.</li>
            <li>Aceitamos PIX, cartão de crédito (parcelamento em até 10× sem juros) e boleto bancário. O processamento de pagamentos eletrônicos é realizado pelo Mercado Pago.</li>
            <li>O boleto tem vencimento em até 3 dias úteis; se não for pago até o vencimento, o pedido é automaticamente cancelado e a peça liberada para outros compradores.</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>4. Direito de arrependimento e cancelamento</h2>
          <p style={P_STYLE}>
            Em conformidade com o Art. 49 do Código de Defesa do Consumidor, você
            tem o direito de se arrepender da compra em até <strong>7 (sete) dias
            corridos</strong> a contar da data do pedido, sem necessidade de
            justificativa. Você pode solicitar o cancelamento diretamente pela sua
            conta em &quot;Minha Conta &gt; Meus Pedidos &gt; Ver detalhes&quot;, enquanto o
            pedido estiver com status Aguardando Pagamento, Pago ou Em
            Processamento.
          </p>
          <p style={P_STYLE}>
            Ao cancelar um pedido já pago, o valor será estornado pela mesma forma
            de pagamento utilizada, respeitando os prazos operacionais do meio de
            pagamento (PIX, cartão ou boleto). Após o prazo de 7 dias, ou se o pedido
            já tiver sido enviado, entre em contato pelo WhatsApp para avaliarmos o
            caso.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>5. Autenticidade e garantias</h2>
          <p style={P_STYLE}>
            Todas as peças passam pelo processo de autenticação descrito na nossa
            página de <Link href="/autenticidade" style={{ color: 'var(--burgundy-700)' }}>Autenticidade &amp; Garantias</Link>.
            Peças com certificado de autenticidade emitido pela La Zecca têm esse
            documento entregue junto com a peça. Em caso de dúvida sobre a
            autenticidade de uma peça recebida, entre em contato imediatamente
            pelos canais de atendimento.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>6. Uso aceitável do site</h2>
          <p style={P_STYLE}>Ao usar este site, você concorda em não:</p>
          <ul style={UL_STYLE}>
            <li>Tentar acessar áreas administrativas ou dados de outros usuários sem autorização;</li>
            <li>Utilizar scripts automatizados para criar contas em massa, forçar login ou manipular o estoque;</li>
            <li>Fornecer informações falsas no cadastro ou na finalização de pedidos;</li>
            <li>Utilizar o conteúdo do site (fotos, descrições, textos) para fins comerciais próprios sem autorização.</li>
          </ul>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>7. Propriedade intelectual</h2>
          <p style={P_STYLE}>
            Todo o conteúdo deste site — textos, fotografias das peças, identidade
            visual e marca &quot;La Zecca Numismática&quot; — pertence à La Zecca ou é usado
            sob licença, e não pode ser reproduzido sem autorização prévia.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>8. Privacidade e dados pessoais</h2>
          <p style={P_STYLE}>
            O tratamento dos seus dados pessoais é descrito em detalhes na nossa{' '}
            <Link href="/politica-de-privacidade" style={{ color: 'var(--burgundy-700)' }}>Política de Privacidade</Link>,
            que faz parte integrante destes Termos de Uso.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>9. Alterações a estes termos</h2>
          <p style={P_STYLE}>
            Podemos atualizar estes Termos de Uso periodicamente para refletir
            mudanças no funcionamento do site ou na legislação aplicável. A data da
            última atualização estará sempre indicada no topo desta página.
          </p>
        </section>

        <section style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>10. Contato</h2>
          <p style={P_STYLE}>
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelos
            canais informados na nossa{' '}
            <Link href="/contato" style={{ color: 'var(--burgundy-700)' }}>página de contato</Link>,
            pelo e-mail <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--burgundy-700)' }}>{CONTACT.email}</a>{' '}
            ou pelo telefone <a href={CONTACT.phoneHref} style={{ color: 'var(--burgundy-700)' }}>{CONTACT.phoneDisplay}</a>.
          </p>
        </section>

        <div style={{ marginTop: 40 }}>
          <Link href="/" className="btn btn-outline">Voltar ao início</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
