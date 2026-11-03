// Order pricing: line totals, promo codes, and order totals.

export const PROMO_CODES = {
  SPRING10: 0.1,
  STAFF20: 0.2,
};

export function roundCents(amount) {
  return Math.round(amount * 100) / 100;
}

export function promoRate(code) {
  if (!code) return 0;
  return PROMO_CODES[code] ?? 0;
}

export function lineTotal(line) {
  return roundCents(line.unitPrice * line.quantity);
}

export function orderTotal(order) {
  const subtotal = order.lines.reduce((sum, line) => sum + lineTotal(line), 0);
  return roundCents(subtotal * (1 - promoRate(order.promoCode)));
}
