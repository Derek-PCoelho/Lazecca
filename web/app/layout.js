import './globals.css';
import CookieConsentBanner from '@/components/CookieConsentBanner';

// Bloco 9 (SEO) — URL base usada para resolver metadados relativos (og:image,
// canonical, etc.) e como fallback quando NEXT_PUBLIC_SITE_URL não estiver
// definido (ex.: ambiente de preview/build local).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
const SITE_TITLE = 'La Zecca Numismática';
const SITE_DESCRIPTION =
  'La Zecca — numismática de curadoria desde 1998. Cédulas e moedas antigas autenticadas, apresentadas pelo Dr. Sergio Costa.';

// Cache-buster para os ícones da aba do navegador. Navegadores (Chrome,
// Firefox, Safari) cacheiam favicon.ico/PNGs de forma muito agressiva por
// domínio — às vezes por semanas — ignorando os headers HTTP normais de
// cache. Anexar uma query string única em cada troca de favicon força o
// navegador a buscar o arquivo novo em vez de reusar a versão antiga já
// salva localmente. Alterar este valor sempre que o arquivo de favicon for
// substituído novamente no futuro.
//
// IMPORTANTE: favicon.ico foi movido de app/favicon.ico para
// public/favicon.ico. O Next.js App Router injeta automaticamente um
// <link rel="icon" href="/favicon.ico"> (sem query string) sempre que
// existe um app/favicon.ico — essa tag automática vem ANTES da nossa tag
// versionada no <head>, e os navegadores usam a primeira ocorrência, o
// que anulava silenciosamente este cache-buster. Servindo o arquivo a
// partir de public/ em vez da convenção de arquivo do App Router, apenas
// as tags declaradas abaixo (com ?v=) são renderizadas.
const FAVICON_VERSION = 'v3';

// Fontes carregadas via Google Fonts CDN (idêntico ao protótipo), preservando
// preconnect para fonts.googleapis.com / fonts.gstatic.com.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: `/favicon.ico?${FAVICON_VERSION}`, sizes: '16x16', type: 'image/x-icon' },
      { url: `/assets/favicon-32.png?${FAVICON_VERSION}`, sizes: '32x32', type: 'image/png' },
      { url: `/assets/favicon-48.png?${FAVICON_VERSION}`, sizes: '48x48', type: 'image/png' },
      { url: `/assets/favicon-180.png?${FAVICON_VERSION}`, sizes: '180x180', type: 'image/png' },
    ],
    apple: [{ url: `/assets/favicon-180.png?${FAVICON_VERSION}`, sizes: '180x180', type: 'image/png' }],
    shortcut: `/assets/favicon-48.png?${FAVICON_VERSION}`,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Bloco 9 (SEO) — Schema.org (JSON-LD) da organização, presente em todas as
// páginas via layout raiz. Ajuda buscadores a exibir rich results (nome da
// loja, contato, endereço) na busca e no Google Knowledge Panel.
function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_TITLE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    telephone: '+55 85 9655-3044',
    email: 'atendimento@lazecca.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'R. do Pocinho, 33 · Sala 425',
      addressLocality: 'Fortaleza',
      addressRegion: 'CE',
      postalCode: '60055-120',
      addressCountry: 'BR',
    },
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <OrganizationJsonLd />
      </head>
      <body>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
