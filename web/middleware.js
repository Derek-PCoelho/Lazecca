import { NextResponse } from 'next/server';

// =============================================================================
// Modo de manutenção (site ainda não pronto para ser público)
// -----------------------------------------------------------------------------
// Ativado via variável de ambiente MAINTENANCE_MODE=true. Quando ativo:
//   - Qualquer visitante público recebe uma página "Em breve" com status
//     HTTP 503 (correto para SEO: sinaliza indisponibilidade temporária,
//     sem remover o site do índice de buscadores).
//   - Arquivos estáticos essenciais (_next/*, favicon, robots, etc.)
//     continuam passando normalmente.
//   - Quem acessa `/?bypass=<MAINTENANCE_BYPASS_TOKEN>` uma vez recebe um
//     cookie de 30 dias e passa a ver o site normalmente (inclusive
//     /admin), permitindo revisar/testar tudo antes do lançamento público.
//   - Para desligar: remover/alterar MAINTENANCE_MODE nas variáveis de
//     ambiente e reiniciar a aplicação (não precisa de novo build).
// =============================================================================

const BYPASS_COOKIE = 'lz_preview_access';
const BYPASS_QUERY_PARAM = 'bypass';

function isMaintenanceOn() {
  return String(process.env.MAINTENANCE_MODE || '').toLowerCase() === 'true';
}

function isAssetPath(pathname) {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    /\.(png|jpg|jpeg|webp|gif|svg|ico|css|js|map|woff2?|ttf)$/.test(pathname)
  );
}

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>La Zecca Numismática — Em breve</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5EFE4;
    color: #1F1613;
    font-family: Georgia, 'Times New Roman', serif;
    padding: 24px;
    text-align: center;
  }
  .card {
    max-width: 480px;
  }
  .emblem {
    font-size: 40px;
    margin-bottom: 8px;
  }
  h1 {
    font-size: 26px;
    letter-spacing: 0.04em;
    color: #6B1F2A;
    margin: 0 0 4px;
  }
  .tag {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #A88A4A;
    margin: 0 0 28px;
  }
  p {
    font-size: 16px;
    line-height: 1.6;
    color: #3D2F28;
    margin: 0 0 8px;
  }
  .small {
    font-size: 13px;
    color: #6B5A50;
    margin-top: 24px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="emblem">&#9878;</div>
    <h1>LA ZECCA NUMISM&Aacute;TICA</h1>
    <p class="tag">Curadoria numism&aacute;tica &middot; desde 1998</p>
    <p>Estamos preparando algo especial.</p>
    <p>Nosso site estar&aacute; de volta em breve.</p>
    <p class="small">Obrigado pela paci&ecirc;ncia.</p>
  </div>
</body>
</html>`;

export function middleware(request) {
  if (!isMaintenanceOn()) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  if (isAssetPath(pathname)) {
    return NextResponse.next();
  }

  const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN;
  const providedToken = searchParams.get(BYPASS_QUERY_PARAM);
  const hasValidCookie = Boolean(
    bypassToken && request.cookies.get(BYPASS_COOKIE)?.value === bypassToken
  );

  // Link secreto de acesso: valida o token e grava o cookie de liberação,
  // depois redireciona para a mesma URL sem o parâmetro na barra de endereço.
  if (bypassToken && providedToken === bypassToken) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete(BYPASS_QUERY_PARAM);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(BYPASS_COOKIE, bypassToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });
    return response;
  }

  if (hasValidCookie) {
    return NextResponse.next();
  }

  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '3600',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'no-store',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
