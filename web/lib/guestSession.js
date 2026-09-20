// =============================================================================
// Sessão de convidado (carrinho persistente sem login)
// =============================================================================
// Usuários não autenticados também têm um carrinho persistente no banco de
// dados (não mais localStorage), identificado por um token de sessão salvo
// em cookie (não-httpOnly seria arriscado só se guardássemos algo sensível;
// aqui é só um identificador aleatório sem valor fora do carrinho, então
// mantemos httpOnly=true também, por padrão de segurança).
// =============================================================================

import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const GUEST_COOKIE = 'lz_guest';

export async function getOrCreateGuestToken() {
  const store = await cookies();
  let token = store.get(GUEST_COOKIE)?.value;
  if (!token) {
    token = randomUUID();
    store.set(GUEST_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 90, // 90 dias
    });
  }
  return token;
}

export async function getGuestToken() {
  const store = await cookies();
  return store.get(GUEST_COOKIE)?.value || null;
}
