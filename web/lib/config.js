// La Zecca — Configuração central de negócio
// Centraliza valores que antes estavam hardcoded em múltiplos componentes do protótipo
// (Melhoria 18: telefone/WhatsApp centralizados; regra de desconto PIX; opções de frete — Melhoria 6)

export const PIX_DISCOUNT_RATE = 0.05; // 5% de desconto no PIX (confirmado em product.html, cart.html, checkout.html)

export const CONTACT = {
  phoneDisplay: '(85) 9655-3044',
  phoneIntl: '+558596553044',
  phoneHref: 'tel:+558596553044',
  whatsappHref: 'https://wa.me/558596553044',
  email: 'atendimento@lazecca.com.br',
  address: 'R. do Pocinho, 33 · Sala 425',
  addressFull: 'R. do Pocinho, 33 · Sala 425 · Centro · Fortaleza/CE · CEP 60055-120',
  city: 'Centro · Fortaleza/CE',
  hours: 'Seg à Sex · 09h às 16h',
  // Coordenadas exatas da loja (obtidas via geocodificação Nominatim/OpenStreetMap
  // a partir do endereço completo). Usadas no embed do Google Maps em vez da busca
  // por texto (`q=<endereço>`), que não garantia o pino centralizado no quadro —
  // com lat/lng explícitos + parâmetro `ll` o Google Maps sempre centraliza o
  // pino exatamente no meio do iframe, independente do tamanho da tela.
  lat: -3.7279566,
  lng: -38.5254365,
};

// Melhoria 6 — Frete funcional por transportadora.
// Cada modalidade tem preço e prazo próprios. A regra de frete grátis acima de R$500
// permanece válida como uma das condições possíveis (aplicada a todas as modalidades
// pagas quando o subtotal ultrapassa o limiar; a retirada na loja é sempre gratuita).
export const FREE_SHIPPING_THRESHOLD = 500;

export const SHIPPING_METHODS = [
  { id: 'pac', label: 'PAC', prazo: '5-7 dias úteis', price: 24.9 },
  { id: 'sedex', label: 'SEDEX', prazo: '2-3 dias úteis', price: 42.0 },
  { id: 'sedex10', label: 'SEDEX 10', prazo: '1 dia útil', price: 68.0 },
  { id: 'retirada', label: 'Retirar na Loja (Centro/Fortaleza)', prazo: 'Imediato', price: 0 },
];

export function getShippingPrice(methodId, subtotal) {
  const method = SHIPPING_METHODS.find((m) => m.id === methodId) || SHIPPING_METHODS[0];
  if (method.id === 'retirada') return 0;
  if (subtotal > FREE_SHIPPING_THRESHOLD) return 0;
  return method.price;
}

export const INSTALLMENTS_MAX = 10;

// Melhoria 7 — novos produtos de demonstração (isSample) recebem IDs a partir deste número,
// já que a planilha real confirma 135 cédulas sequenciais C0001–C0135 sem lacunas.
export const NEXT_SAMPLE_ID_START = 136;
