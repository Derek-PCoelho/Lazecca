import './globals.css';
import CookieConsentBanner from '@/components/CookieConsentBanner';

// Bloco 9 (SEO) — URL base usada para resolver metadados relativos (og:image,
// canonical, etc.) e como fallback quando NEXT_PUBLIC_SITE_URL não estiver
// definido (ex.: ambiente de preview/build local).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
const SITE_TITLE = 'La Zecca Numismática';
const SITE_DESCRIPTION =
  'La Zecca — numismática de curadoria desde 1998. Cédulas e moedas antigas autenticadas, apresentadas pelo Dr. Sergio Costa.';

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
      { url: '/assets/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/assets/favicon-180.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [{ url: '/assets/favicon-180.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/assets/favicon-48.png',
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
