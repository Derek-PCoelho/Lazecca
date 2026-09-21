import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CONTACT } from '@/lib/config';

// =============================================================================
// Bloco 7 — Política de Privacidade (LGPD)
// =============================================================================
// Conteúdo real, substituindo o placeholder anterior "Em construção".
// Escrito com base nos dados efetivamente tratados pelo sistema (auditado no
// código: cadastro de conta, checkout, contato, cookies técnicos de sessão
// httpOnly) — não descreve nenhuma coleta de dado que o código não realize.
//
// IMPORTANTE (transparência com o cliente): este texto foi redigido para
// refletir fielmente o comportamento real do sistema e cobrir os pontos
// obrigatórios da LGPD (Lei 13.709/2018) para um e-commerce de pequeno porte.
// Não substitui uma revisão jurídica formal — recomenda-se que um advogado
// do cliente revise antes da publicação definitiva, especialmente a razão
// social/CNPJ (ainda não formalizados no sistema) e eventuais obrigações
// setoriais específicas do comércio de numismática/colecionismo.
// =============================================================================

export const metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a La Zecca Numismática coleta, usa, armazena e protege os dados pessoais de clientes e visitantes, em conformidade com a LGPD.',
  alternates: { canonical: '/politica-de-privacidade' },
};

const SECTION_STYLE = { marginTop: 32 };
const H2_STYLE = { fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--burgundy-900)', marginBottom: 8 };
const P_STYLE = { color: 'var(--ink-500)', marginTop: 8, lineHeight: 1.7 };
const UL_STYLE = { color: 'var(--ink-500)', marginTop: 8, lineHeight: 1.7, paddingLeft: 20 };

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <Header />
      <div className="container" style={{ padding: '64px 0 96px', maxWidth: 760 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--burgundy-900)', marginTop: 8 }}>
          Política de Privacidade
        </h1>
        <p style={{ color: 'var(--ink-500)', marginTop: 16, lineHeight: 1.7 }}>
          Última atualização: setembro de 2026. Esta Política de Privacidade descreve
          como a <strong>La Zecca Numismática</strong> coleta, usa, armazena, compartilha
          e protege os dados pessoais de clientes e visitantes deste site, em
          conformidade com a Lei Geral de Proteção de Dados Pessoais
          (Lei nº 13.709/2018 — LGPD).
        </p>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>1. Quais dados coletamos</h2>
          <p style={P_STYLE}>Coletamos apenas os dados necessários para operar a loja e atender você:</p>
          <ul style={UL_STYLE}>
            <li><strong>Cadastro de conta:</strong> nome, e-mail, senha (armazenada com hash criptográfico, nunca em texto puro), CPF e telefone (opcionais, usados para identificação em pedidos e nota fiscal).</li>
            <li><strong>Endereços de entrega:</strong> CEP, rua, número, complemento, bairro, cidade e estado, associados à sua conta.</li>
            <li><strong>Pedidos:</strong> itens comprados, valores, forma de pagamento escolhida e status do pedido.</li>
            <li><strong>Formulário de contato:</strong> nome, e-mail, telefone, assunto e mensagem enviados voluntariamente por você.</li>
            <li><strong>Dados técnicos de sessão:</strong> um cookie de sessão (<code>lz_session</code>), estritamente necessário para mantê-lo autenticado após o login (ver seção 6, &quot;Cookies&quot;).</li>
          </ul>
          <p style={P_STYLE}>
            Não coletamos dados de pagamento (número de cartão, CVV) diretamente — quando o
            pagamento por cartão estiver ativo, ele é processado diretamente pelo Mercado
            Pago, que possui sua própria política de privacidade e certificação PCI-DSS.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>2. Para que usamos seus dados</h2>
          <ul style={UL_STYLE}>
            <li>Processar seu cadastro, login e gerenciamento de conta;</li>
            <li>Processar pedidos, calcular frete, emitir nota fiscal e organizar a entrega;</li>
            <li>Enviar e-mails transacionais (confirmação de pedido, redefinição de senha, atualização de status);</li>
            <li>Responder mensagens enviadas pelo formulário de contato;</li>
            <li>Enviar comunicações de marketing (Correio do Curador), <strong>somente</strong> se você optar por recebê-las no cadastro ou no checkout — essa opção pode ser desativada a qualquer momento em &quot;Minha Conta &gt; Dados Pessoais&quot;;</li>
            <li>Cumprir obrigações legais e fiscais (emissão de nota fiscal, guarda de registros de venda pelo prazo exigido por lei);</li>
            <li>Prevenir fraudes e abusos (ex.: limitação de tentativas de login, detecção de concorrência indevida no estoque).</li>
          </ul>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>3. Compartilhamento de dados</h2>
          <p style={P_STYLE}>Seus dados podem ser compartilhados apenas com:</p>
          <ul style={UL_STYLE}>
            <li><strong>Transportadoras/Correios</strong>, para cálculo de frete e entrega do seu pedido (nome, endereço e telefone);</li>
            <li><strong>Mercado Pago</strong>, quando o pagamento eletrônico estiver ativo, para processar sua transação;</li>
            <li><strong>Provedor de hospedagem (Hostinger)</strong>, onde o banco de dados e a aplicação estão armazenados, sob contrato de confidencialidade padrão do provedor;</li>
            <li><strong>Autoridades públicas</strong>, quando exigido por lei ou ordem judicial.</li>
          </ul>
          <p style={P_STYLE}>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros
            para fins de publicidade de terceiros.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>4. Por quanto tempo guardamos seus dados</h2>
          <p style={P_STYLE}>
            Mantemos seus dados de cadastro enquanto sua conta estiver ativa. Dados de
            pedidos são mantidos pelo prazo mínimo exigido pela legislação fiscal e
            consumerista brasileira (geralmente 5 anos). Você pode solicitar a exclusão
            da sua conta a qualquer momento (ver seção 5), respeitadas as obrigações
            legais de guarda de registros fiscais.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>5. Seus direitos como titular dos dados</h2>
          <p style={P_STYLE}>De acordo com a LGPD, você tem direito a:</p>
          <ul style={UL_STYLE}>
            <li>Confirmar a existência de tratamento dos seus dados;</li>
            <li>Acessar os dados que temos sobre você;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados (você mesmo pode fazer isso em &quot;Minha Conta &gt; Dados Pessoais&quot;);</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;</li>
            <li>Solicitar a portabilidade dos seus dados a outro fornecedor;</li>
            <li>Revogar o consentimento (por exemplo, cancelar o recebimento de e-mails de marketing) a qualquer momento;</li>
            <li>Solicitar a exclusão da sua conta e dos dados associados, respeitadas obrigações legais de guarda.</li>
          </ul>
          <p style={P_STYLE}>
            Para exercer qualquer um desses direitos, entre em contato pelos canais
            informados na nossa{' '}
            <Link href="/contato" style={{ color: 'var(--burgundy-700)' }}>página de contato</Link>{' '}
            ou pelo e-mail <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--burgundy-700)' }}>{CONTACT.email}</a>.
            Responderemos sua solicitação em prazo razoável, conforme previsto em lei.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>6. Cookies</h2>
          <p style={P_STYLE}>
            Utilizamos apenas um cookie estritamente necessário ao funcionamento do
            site: o cookie de sessão (<code>lz_session</code>), que mantém você
            autenticado depois de fazer login. Esse cookie é do tipo <code>httpOnly</code>{' '}
            (não pode ser lido por scripts do navegador, o que reduz o risco de roubo de
            sessão) e expira automaticamente em até 7 dias ou quando você faz logout.
          </p>
          <p style={P_STYLE}>
            Não utilizamos cookies de rastreamento de terceiros, publicidade
            comportamental ou ferramentas de análise (como Google Analytics) neste
            momento. Caso isso mude no futuro, esta política será atualizada e o banner
            de cookies exibido no rodapé do site passará a oferecer opções granulares de
            consentimento para cookies não essenciais.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>7. Segurança dos dados</h2>
          <p style={P_STYLE}>
            Adotamos medidas técnicas para proteger seus dados: senhas armazenadas com
            hash criptográfico (nunca em texto puro), conexão HTTPS em todo o site,
            cabeçalhos HTTP de segurança (proteção contra clickjacking e XSS), limitação
            de tentativas de login para dificultar ataques automatizados, e controle de
            acesso restrito ao painel administrativo.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>8. Alterações a esta política</h2>
          <p style={P_STYLE}>
            Podemos atualizar esta Política de Privacidade periodicamente. A data da
            última atualização estará sempre indicada no topo desta página.
            Recomendamos que você a revise periodicamente.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>9. Contato</h2>
          <p style={P_STYLE}>
            Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento
            dos seus dados pessoais, entre em contato pelos canais informados na nossa{' '}
            <Link href="/contato" style={{ color: 'var(--burgundy-700)' }}>página de contato</Link>,
            pelo e-mail <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--burgundy-700)' }}>{CONTACT.email}</a>{' '}
            ou pelo telefone <a href={CONTACT.phoneHref} style={{ color: 'var(--burgundy-700)' }}>{CONTACT.phoneDisplay}</a>.
          </p>
        </div>

        <div style={{ marginTop: 40 }}>
          <Link href="/" className="btn btn-outline">Voltar ao início</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
