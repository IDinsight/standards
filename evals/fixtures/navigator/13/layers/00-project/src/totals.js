import { percentOf } from './money.js';

export function lineTotal(line) {
  if (!Number.isInteger(line.quantity) || line.quantity < 1) {
    throw new RangeError(`invalid quantity for ${line.sku}`);
  }
  if (!Number.isInteger(line.unitCents) || line.unitCents < 0) {
    throw new RangeError(`invalid price for ${line.sku}`);
  }
  return line.quantity * line.unitCents;
}

// The discount applies before tax and never exceeds the subtotal.
export function invoiceTotals(invoice) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const discount = Math.min(subtotal, invoice.discountCents ?? 0);
  const taxable = subtotal - discount;
  const tax = percentOf(taxable, invoice.taxBasisPoints ?? 0);
  return { subtotal, discount, tax, total: taxable + tax };
}
