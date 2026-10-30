import { roundCents } from './rounding.js';

export function lineTotal(item) {
  return roundCents(item.quantity * item.unitPrice);
}

export function invoiceTotal(items, { taxRate = 0, discountRate = 0 } = {}) {
  if (discountRate < 0 || discountRate > 1) {
    throw new RangeError('discountRate must be between 0 and 1');
  }
  const subtotal = roundCents(items.reduce((sum, item) => sum + lineTotal(item), 0));
  const discount = roundCents(subtotal * discountRate);
  const taxable = roundCents(subtotal - discount);
  const tax = roundCents(taxable * taxRate);
  return { subtotal, discount, tax, total: roundCents(taxable + tax) };
}
