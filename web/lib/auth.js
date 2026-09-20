// =============================================================================
// Autenticação real (Melhoria 3) — JWT + bcrypt
// =============================================================================
// Substitui o mock anterior (localStorage['lz_logged']) por sessão real:
//   - Senha armazenada com hash bcrypt (nunca em texto puro)
//   - Sessão via JWT assinado, guardado em cookie httpOnly (não acessível a JS
//     do navegador, mitigando roubo de sessão via XSS)
// =============================================================================

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const SESSION_COOKIE = 'lz_session';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signSession(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/** Define o cookie de sessão httpOnly. Chame dentro de uma Route Handler (POST). */
export async function setSessionCookie(token) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Lê o usuário autenticado a partir do cookie de sessão (Server Component ou Route Handler). */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) return null;
  return user;
}

/** Helper para Route Handlers que exigem login. Retorna { user } ou { error, status }. */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Não autenticado.', status: 401 };
  return { user };
}

/** Helper para Route Handlers que exigem papel ADMIN. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Não autenticado.', status: 401 };
  if (user.role !== 'ADMIN') return { error: 'Acesso restrito ao administrador.', status: 403 };
  return { user };
}
