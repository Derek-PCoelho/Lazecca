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
const nextConfig = {
  output: 'standalone',
  images: {
    // A hospedagem compartilhada não expõe um serviço de otimização de imagem
    // dedicado; mantemos unoptimized para simplicidade e desempenho previsível.
    unoptimized: true,
  },
};

export default nextConfig;
