'use client';

import { validatePasswordStrength } from '@/lib/validation';
import Icon from './Icon';

// Bloco 6 — feedback específico de qual critério de senha forte falta,
// nunca uma mensagem genérica de "senha inválida". Usado no cadastro, na
// troca de senha do perfil e na redefinição de senha.
export default function PasswordStrengthHints({ password }) {
  const { criteria } = validatePasswordStrength(password || '');
  const items = [
    { key: 'length', label: 'Mínimo de 12 caracteres' },
    { key: 'uppercase', label: '1 letra maiúscula' },
    { key: 'number', label: '1 número' },
    { key: 'symbol', label: '1 símbolo especial (@ # $ % ! ...)' },
  ];
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', fontSize: 12 }}>
      {items.map((it) => {
        const ok = criteria[it.key];
        return (
          <li
            key={it.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: ok ? 'var(--success)' : 'var(--ink-500)',
              marginBottom: 2,
            }}
          >
            <Icon name={ok ? 'check' : 'x'} size={12} />
            {it.label}
          </li>
        );
      })}
    </ul>
  );
}
