import AuthenticityClient from './AuthenticityClient';

export const metadata = {
  title: 'Autenticidade & Garantias das Peças',
  description: 'Como a La Zecca Numismática autentica cada cédula e moeda antiga: processo de curadoria em quatro etapas, certificado próprio e garantias por escrito para colecionadores.',
  alternates: { canonical: '/autenticidade' },
  openGraph: {
    title: 'Autenticidade & Garantias · La Zecca Numismática',
    description: 'Processo de autenticação em quatro etapas, certificado La Zecca e garantias por escrito para colecionadores de cédulas e moedas antigas.',
    url: '/autenticidade',
  },
};

export default function AuthenticityPage() {
  return <AuthenticityClient />;
}
