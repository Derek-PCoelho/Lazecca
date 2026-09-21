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
};

export default nextConfig;
