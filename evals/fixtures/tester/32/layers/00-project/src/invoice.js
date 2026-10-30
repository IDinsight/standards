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
  const tax = roundCents((subtotal * invoice.taxRatePercent) / 100);
  return { subtotalCents: subtotal, taxCents: tax, totalCents: subtotal + tax };
}
