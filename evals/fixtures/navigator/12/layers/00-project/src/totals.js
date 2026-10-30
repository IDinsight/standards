import { lineTotal } from './cart.js';

const TAX_RATE = 0.08;

export function computeTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}
