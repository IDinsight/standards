import { subtotal } from './cart.js';

export const DEFAULT_TAX_RATE = 0.08;

export function totals(items, { taxRate = DEFAULT_TAX_RATE } = {}) {
  const sub = subtotal(items);
  const tax = Math.round(sub * taxRate);
  return { subtotal: sub, tax, total: sub + tax };
}
