// =============================================================================
// La Zecca — Validações de cadastro/conta (Bloco 6)
// =============================================================================
// Módulo isomórfico (sem dependências de Node/browser específicas) para que as
// MESMAS regras rodem tanto no frontend (feedback rápido enquanto o usuário
// digita) quanto no backend (fonte de verdade — nenhuma API confia em
// validação feita só no navegador). Import de qualquer lado: 'use client'
// components ou Route Handlers.
// =============================================================================

// -----------------------------------------------------------------------------
// CPF — algoritmo oficial de dígito verificador
// -----------------------------------------------------------------------------

/** Remove tudo que não é dígito. */
export function onlyDigits(str) {
  return String(str || '').replace(/\D/g, '');
}

/** Formata CPF para exibição: 12345678900 -> 123.456.789-00 */
export function formatCpf(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Valida CPF pelo algoritmo oficial de dígito verificador (Receita Federal).
 * Aceita entrada com ou sem pontuação. Rejeita:
 *  - tamanho diferente de 11 dígitos
 *  - todos os dígitos iguais (111.111.111-11, 000.000.000-00, etc — passam
 *    em checagens simples de tamanho mas são matematicamente inválidos)
 *  - dígito verificador incorreto
 * Retorna { valid: boolean, reason?: string }.
 */
export function validateCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) {
    return { valid: false, reason: 'CPF deve ter 11 dígitos.' };
  }
  if (/^(\d)\1{10}$/.test(cpf)) {
    return { valid: false, reason: 'CPF inválido (todos os dígitos iguais).' };
  }

  const calcCheckDigit = (base) => {
    let sum = 0;
    let weight = base.length + 1;
    for (const digit of base) {
      sum += Number(digit) * weight;
      weight -= 1;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const digits = cpf.slice(0, 9);
  const dv1 = calcCheckDigit(digits);
  const dv2 = calcCheckDigit(digits + String(dv1));

  if (String(dv1) !== cpf[9] || String(dv2) !== cpf[10]) {
    return { valid: false, reason: 'CPF inválido (dígito verificador incorreto).' };
  }
  return { valid: true };
}

// -----------------------------------------------------------------------------
// Senha forte — mínimo 12 caracteres, 1 maiúscula, 1 número, 1 símbolo
// -----------------------------------------------------------------------------

const PASSWORD_MIN_LENGTH = 12;
const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

/**
 * Valida força da senha, retornando quais critérios específicos falharam
 * (nunca uma mensagem genérica), conforme exigido pelo Bloco 6.
 * Retorna { valid, failures: string[], criteria: {length, uppercase, number, symbol} }
 */
export function validatePasswordStrength(password) {
  const pass = String(password || '');
  const criteria = {
    length: pass.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(pass),
    number: /[0-9]/.test(pass),
    symbol: SPECIAL_CHARS_REGEX.test(pass),
  };
  const failures = [];
  if (!criteria.length) failures.push(`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres (atual: ${pass.length}).`);
  if (!criteria.uppercase) failures.push('Pelo menos 1 letra maiúscula.');
  if (!criteria.number) failures.push('Pelo menos 1 número.');
  if (!criteria.symbol) failures.push('Pelo menos 1 símbolo especial (@ # $ % ! etc).');
  return { valid: failures.length === 0, failures, criteria };
}

export const PASSWORD_RULES_TEXT =
  `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres, com 1 letra maiúscula, 1 número e 1 símbolo especial (@ # $ % ! etc).`;

// -----------------------------------------------------------------------------
// E-mail
// -----------------------------------------------------------------------------

// Regex pragmática (RFC 5322 simplificada) — suficiente para rejeitar formatos
// claramente inválidos sem bloquear e-mails reais incomuns.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value) {
  const email = String(value || '').trim();
  if (!email) return { valid: false, reason: 'Informe um e-mail.' };
  if (!EMAIL_REGEX.test(email)) return { valid: false, reason: 'Formato de e-mail inválido.' };
  return { valid: true };
}

// -----------------------------------------------------------------------------
// Telefone / WhatsApp brasileiro — com DDD
// -----------------------------------------------------------------------------

/** Formata para exibição: 85987654321 -> (85) 98765-4321 */
export function formatPhone(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
  21, 22, 24, // RJ
  27, 28, // ES
  31, 32, 33, 34, 35, 37, 38, // MG
  41, 42, 43, 44, 45, 46, // PR
  47, 48, 49, // SC
  51, 53, 54, 55, // RS
  61, // DF
  62, 64, // GO
  63, // TO
  65, 66, // MT
  67, // MS
  68, // AC
  69, // RO
  71, 73, 74, 75, 77, // BA
  79, // SE
  81, 87, // PE
  82, // AL
  83, // PB
  84, // RN
  85, 88, // CE
  86, 89, // PI
  91, 93, 94, // PA
  92, 97, // AM
  95, // RR
  96, // AP
  98, 99, // MA
]);

/**
 * Valida telefone/celular brasileiro com DDD: 10 dígitos (fixo) ou 11 dígitos
 * (celular, 9º dígito) e DDD dentro da lista oficial de códigos válidos.
 */
export function validatePhone(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) {
    return { valid: false, reason: 'Telefone deve ter 10 ou 11 dígitos (com DDD).' };
  }
  const ddd = Number(digits.slice(0, 2));
  if (!VALID_DDDS.has(ddd)) {
    return { valid: false, reason: 'DDD inválido.' };
  }
  if (digits.length === 11 && digits[2] !== '9') {
    return { valid: false, reason: 'Celular deve começar com 9 após o DDD.' };
  }
  return { valid: true };
}

// -----------------------------------------------------------------------------
// CEP brasileiro
// -----------------------------------------------------------------------------

/** Formata para exibição: 60055120 -> 60055-120 */
export function formatCep(value) {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function validateCepFormat(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return { valid: false, reason: 'CEP deve ter 8 dígitos (ex: 00000-000).' };
  if (/^0{8}$/.test(digits)) return { valid: false, reason: 'CEP inválido.' };
  return { valid: true };
}

/**
 * Confirma a EXISTÊNCIA do CEP consultando a API pública ViaCEP (mesma
 * natureza de integração de endereço usada no cálculo de frete — Correios).
 * Só deve ser chamada no servidor ou com throttling no client, já que
 * depende de uma API externa. Retorna null em caso de falha de rede (não
 * bloqueia o cadastro só porque a API de terceiros está fora do ar).
 */
export async function lookupCep(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return { exists: false };
    return {
      exists: true,
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch {
    return null; // falha de rede — não bloqueia
  }
}

// -----------------------------------------------------------------------------
// Nome completo
// -----------------------------------------------------------------------------

export function validateFullName(value) {
  const name = String(value || '').trim();
  if (!name) return { valid: false, reason: 'Informe o nome completo.' };
  if (/^\d+$/.test(name.replace(/\s+/g, ''))) {
    return { valid: false, reason: 'Nome não pode conter apenas números.' };
  }
  if (name.replace(/\s+/g, '').length < 2) {
    return { valid: false, reason: 'Nome muito curto.' };
  }
  return { valid: true };
}

// -----------------------------------------------------------------------------
// Data de nascimento
// -----------------------------------------------------------------------------

export function validateBirthDate(value) {
  if (!value) return { valid: true }; // campo opcional
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { valid: false, reason: 'Data inválida.' };
  const now = new Date();
  if (date > now) return { valid: false, reason: 'Data de nascimento não pode ser no futuro.' };
  const age = (now - date) / (1000 * 60 * 60 * 24 * 365.25);
  if (age > 130) return { valid: false, reason: 'Idade implausível.' };
  if (age < 13) return { valid: false, reason: 'Idade mínima de 13 anos.' };
  return { valid: true };
}
