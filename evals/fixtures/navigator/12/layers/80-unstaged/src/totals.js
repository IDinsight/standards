import { readFileSync } from 'node:fs';

import { lineTotal } from './cart.js';
import { discountAmount, findDiscount } from './discounts.js';

const TAX_RATE = 0.08;
const CODES = JSON.parse(readFileSync(new URL('./discount-codes.json', import.meta.url), 'utf8'));

export function computeTotals(items, code) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const discount = code ? findDiscount(code, CODES) : null;
  const discountTotal = discount ? discountAmount(discount, subtotal) : 0;
  const taxable = subtotal - discountTotal;
  const tax = Math.round(taxable * TAX_RATE);
  return { subtotal, discount: discountTotal, tax, total: taxable + tax };
}
