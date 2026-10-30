import { roundCents, toCents } from './money.js';

export function createInvoice({ customer, lines, taxRatePercent = 0 }) {
  if (!customer) throw new Error('customer is required');
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('an invoice needs at least one line');
  }
  return Object.freeze({
    customer,
    taxRatePercent,
    lines: Object.freeze(lines.map((line) => Object.freeze({
      description: line.description,
      quantity: line.quantity,
      unitCents: toCents(line.unitPrice),
    }))),
  });
}

export function subtotalCents(invoice) {
  return invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitCents, 0);
}

export function totals(invoice) {
  const subtotal = subtotalCents(invoice);
  const discount = invoice.discount ? invoice.discount.amountCents : 0;
  const taxable = subtotal - discount;
  const tax = roundCents((taxable * invoice.taxRatePercent) / 100);
  return { subtotalCents: subtotal, discountCents: discount, taxCents: tax, totalCents: taxable + tax };
}
