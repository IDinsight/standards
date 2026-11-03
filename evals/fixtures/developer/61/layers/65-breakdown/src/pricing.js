// Order pricing: line totals, promo codes, and order totals.
import { discountRate } from './discounts.js';

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
  const unitPrice = roundCents(line.unitPrice * (1 - discountRate(line.quantity)));
  return roundCents(unitPrice * line.quantity);
}

export function priceOrder(order) {
  const lines = order.lines.map((line) => {
    const total = lineTotal(line);
    const gross = roundCents(line.unitPrice * line.quantity);
    return { ...line, discount: roundCents(gross - total), total };
  });
  const subtotal = roundCents(lines.reduce((sum, line) => sum + line.total, 0));
  const promoDiscount = roundCents(subtotal * promoRate(order.promoCode));
  return { lines, subtotal, promoDiscount, total: roundCents(subtotal - promoDiscount) };
}

export function orderTotal(order) {
  return priceOrder(order).total;
}
