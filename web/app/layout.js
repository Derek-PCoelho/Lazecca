import './globals.css';

// Fontes carregadas via Google Fonts CDN (idêntico ao protótipo), preservando
// preconnect para fonts.googleapis.com / fonts.gstatic.com.
export const metadata = {
  title: 'Lazecca Numismática',
  description:
    'Lazecca — numismática de curadoria desde 1998. Cédulas e moedas antigas autenticadas, apresentadas pelo Dr. Sergio Costa.',
  icons: {
    icon: [
      { url: '/assets/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/assets/favicon-180.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [{ url: '/assets/favicon-180.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/assets/favicon-48.png',
  },
};

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
      </head>
      <body>{children}</body>
    </html>
  );
}
