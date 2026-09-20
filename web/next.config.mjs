/** @type {import('next').NextConfig} */
// Fase 0 — Verificação de hospedagem (Hostinger): não foi possível confirmar em tempo hábil
// qual plano de hospedagem Hostinger está contratado (compartilhado vs. Business/Cloud com
// suporte a Node.js). Por isso, seguindo o protocolo de fallback do megaprompt (seção 8),
// adotamos por padrão a arquitetura mais portável: exportação estática (`output: 'export'`),
// com dados embutidos em build time via generateStaticParams. Isso implica que:
//  - Não há API routes de servidor nem middleware.
//  - generateMetadata roda em build time (compatível com export estático).
//  - O checkout (Melhoria 2) e o cálculo de frete (Melhoria 6) são implementados como lógica
//    client-side, não como chamadas a um backend real — ver relatório final para detalhes.
// Caso o cliente confirme um plano Hostinger com suporte a Node.js (Business/Cloud/VPS),
// esta é a única linha que precisa mudar (remover output:'export' e habilitar SSR completo).
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
