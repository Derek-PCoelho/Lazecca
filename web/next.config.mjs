/** @type {import('next').NextConfig} */
// =============================================================================
// Fase 0 (atualização) — Confirmado via API oficial da Hostinger que o plano
// contratado ("Unlimited Web Hosting", order_id 1009950960) SUPORTA
// hospedagem Node.js real (HostingNodeJSApi: startNodeJsBuildV1, runtime logs,
// env vars, etc — https://developers.hostinger.com). Isso substitui a decisão
// anterior de export estático.
//
// Arquitetura atual: Next.js standalone (output: 'standalone'), rodando como
// servidor Node.js de verdade no hPanel, com:
//   - API routes reais em app/api/** (autenticação, carrinho, pedidos,
//     pagamento, frete, contato, painel administrativo)
//   - Banco de dados MySQL real (Prisma) hospedado no mesmo plano Hostinger
//   - Checkout (Melhoria 2) e frete (Melhoria 6) processados no servidor,
//     não mais client-side
// =============================================================================
// Bloco 5 — Cabeçalhos de segurança HTTP.
// CSP é propositalmente moderada (permite 'unsafe-inline' em estilo, pois o
// site usa style={{}} inline extensivamente, e em script apenas o necessário
// para o Next.js funcionar) — o objetivo aqui é mitigar clickjacking, MIME
// sniffing e vazamento de referrer, não travar funcionalidades existentes.
// HSTS só faz efeito quando servido sobre HTTPS (confirmar HTTPS ativo em
// produção — ver relatório de testes, Bloco 10).
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://viacep.com.br https://melhorenvio.com.br",
      "frame-src https://maps.google.com https://www.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  output: 'standalone',
  images: {
    // A hospedagem compartilhada não expõe um serviço de otimização de imagem
    // dedicado; mantemos unoptimized para simplicidade e desempenho previsível.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // SEO — canonicalização www -> non-www. O DNS da Hostinger resolve tanto
  // "lazecca.com.br" (ALIAS) quanto "www.lazecca.com.br" (CNAME) para o mesmo
  // app, então sem este redirect o Google via os dois hosts como conteúdo
  // duplicado (ambos HTTP 200, mesmo HTML, sem canonical/redirect entre eles).
  // A versão "www" foi escolhida como não-oficial e passa a redirecionar
  // permanentemente (301) para o domínio raiz, que é a versão usada em todo o
  // site (metadataBase, JSON-LD, canonical tags, sitemap.xml).
  //
  // O destino é um valor ESTÁTICO fixo (não deriva do host da requisição nem
  // de nenhum dado controlado pelo cliente) — isso é importante para não
  // reintroduzir o mesmo padrão de vulnerabilidade do CVE-2026-64645 (SSRF via
  // hostname de destino dinâmico em rewrites/redirects), que exige
  // especificamente que o destino seja atacante-controlável; aqui não é.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.lazecca.com.br' }],
        destination: 'https://lazecca.com.br/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
