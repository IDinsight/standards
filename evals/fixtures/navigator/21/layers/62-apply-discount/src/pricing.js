import { subtotal } from './cart.js';
import { discountAmount, findDiscount } from './discounts.js';

export const DEFAULT_TAX_RATE = 0.08;

export function totals(items, { taxRate = DEFAULT_TAX_RATE, code = null, today = new Date() } = {}) {
  const sub = subtotal(items);
  const discount = discountAmount(findDiscount(code, today), sub);
  const taxable = sub - discount;
  const tax = Math.round(taxable * taxRate);
  return { subtotal: sub, discount, tax, total: taxable + tax };
}
