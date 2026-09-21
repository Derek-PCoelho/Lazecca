// =============================================================================
// Bloco 5 — Rate limiting simples (sem dependência externa)
// =============================================================================
// Implementação em memória (janela fixa), suficiente para o cenário de deploy
// atual (processo Node único no Hostinger via `next start`/standalone, não
// serverless multi-instância). Se no futuro o app rodar em múltiplas
// instâncias/edge, isso precisará migrar para um armazenamento compartilhado
// (Redis, banco, etc.) — deixado documentado aqui para referência futura.
//
// Uso típico numa Route Handler:
//   const rl = checkRateLimit(`login:${ip}`, { windowMs: 15 * 60_000, max: 10 });
//   if (!rl.allowed) return NextResponse.json({ error: '...' }, { status: 429 });
// =============================================================================

const buckets = new Map(); // key -> { count, resetAt }

// Evita crescimento infinito do Map em processos de longa duração: limpa
// entradas expiradas a cada varredura, disparada lazily a partir das próprias
// chamadas de checkRateLimit (sem setInterval, para não segurar o processo
// vivo desnecessariamente em ambientes serverless/edge).
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 5 * 60_000;

function sweepExpired(now) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Verifica e incrementa o contador de tentativas para `key` dentro da janela
 * de tempo `windowMs`. Retorna:
 *   - allowed: boolean — se a tentativa atual pode prosseguir
 *   - remaining: número de tentativas restantes na janela atual
 *   - retryAfterSeconds: quando `allowed` é false, segundos até poder tentar de novo
 */
export function checkRateLimit(key, { windowMs, max }) {
  const now = Date.now();
  sweepExpired(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  const allowed = bucket.count <= max;
  const remaining = Math.max(0, max - bucket.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return { allowed, remaining, retryAfterSeconds };
}

/** Extrai o IP do cliente a partir dos headers padrão de proxy (Hostinger/Nginx). */
export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
