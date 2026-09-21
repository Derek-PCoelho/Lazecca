import './globals.css';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { CONTACT } from '@/lib/config';

// Bloco 9 (SEO) — URL base usada para resolver metadados relativos (og:image,
// canonical, etc.) e como fallback quando NEXT_PUBLIC_SITE_URL não estiver
// definido (ex.: ambiente de preview/build local).
//
// IMPORTANTE: este é o único domínio "oficial"/indexável do site — a versão
// "www" é redirecionada permanentemente (308) para este host em
// next.config.mjs (ver `redirects()`), então toda URL absoluta usada em
// metadados (canonical, og:url, JSON-LD) deve sempre apontar para aqui, sem
// "www", para não reintroduzir conteúdo duplicado aos olhos do Google.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazecca.com.br';
const SITE_TITLE = 'La Zecca Numismática';
const SITE_DESCRIPTION =
  'La Zecca Numismática — cédulas e moedas antigas autenticadas para colecionismo em Fortaleza/CE. Curadoria do Dr. Sergio Costa desde 1998, com certificado de autenticidade e entrega para todo o Brasil.';

// Imagem padrão de compartilhamento social (og:image / twitter:image) usada
// em toda página que não tenha uma foto de produto própria para exibir no
// lugar (ver app/produto/[slug]/page.js, que sobrescreve com a foto real da
// peça). 1024x576px — próximo do formato recomendado (1200x630, ~1.91:1) para
// pré-visualizações em redes sociais e WhatsApp.
const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/assets/hero-flatlay.png`,
  width: 1024,
  height: 576,
  alt: 'Acervo de cédulas e moedas antigas da La Zecca Numismática',
};

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
    default: 'La Zecca Numismática | Cédulas e Moedas Antigas em Fortaleza',
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  // SEO — canonical padrão da home; cada página filha define o seu próprio
  // via `alternates.canonical` (sempre URL absoluta, sem "www").
  alternates: { canonical: SITE_URL },
  keywords: [
    'numismática',
    'numismática Fortaleza',
    'La Zecca',
    'cédulas antigas',
    'moedas antigas',
    'colecionismo',
    'cédulas para colecionadores',
    'moedas para colecionadores',
  ],
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
    title: 'La Zecca Numismática | Cédulas e Moedas Antigas em Fortaleza',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Zecca Numismática | Cédulas e Moedas Antigas em Fortaleza',
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

// Bloco 9 (SEO) — Schema.org (JSON-LD) da organização, presente em todas as
// páginas via layout raiz. Combina Store + LocalBusiness (Store é uma
// subclasse de LocalBusiness no vocabulário do Schema.org, então declarar os
// dois tipos é válido e ajuda o Google a entender tanto "isto é uma loja que
// vende produtos" quanto "isto é um negócio local com endereço físico e
// horário de funcionamento") — habilita rich results de contato/endereço na
// busca e no Knowledge Panel, e é o sinal mais relevante para buscas locais
// como "numismática Fortaleza".
//
// `sameAs` (perfis em redes sociais) foi deliberadamente omitido: no momento
// desta implementação não há nenhum perfil de Instagram/Facebook/Google
// Business Profile configurado para a La Zecca (ver lib/config.js e
// components/Footer.js) — assim que esses perfis existirem, adicionar as
// URLs aqui é a próxima melhoria natural deste bloco.
function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Store', 'LocalBusiness'],
    name: SITE_TITLE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/assets/hero-flatlay.png`,
    logo: `${SITE_URL}/assets/logo-emblem.png`,
    telephone: CONTACT.phoneIntl,
    email: CONTACT.email,
    priceRange: 'R$ 4 – R$ 4.850',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'R. do Pocinho, 33 · Sala 425',
      addressLocality: 'Fortaleza',
      addressRegion: 'CE',
      postalCode: '60055-120',
      addressCountry: 'BR',
    },
    // Coordenadas obtidas via geocodificação reversa (Nominatim/OpenStreetMap)
    // do endereço físico acima — usadas por buscadores para exibir a loja
    // corretamente no mapa em resultados de busca local.
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -3.7279566,
      longitude: -38.5254365,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '16:00',
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
        <ScrollToTopButton />
      </body>
    </html>
  );
}
