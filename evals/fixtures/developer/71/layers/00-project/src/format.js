import { computeTotals } from './totals.js';

const money = (cents) => (cents / 100).toFixed(2);

export function renderInvoice(invoice) {
  const totals = computeTotals(invoice.lines, { taxRate: invoice.taxRate });
  const rows = invoice.lines.map(
    (line) => `${line.description}  ${line.quantity} x ${money(line.unitPriceCents)}`,
  );
  return [
    ...rows,
    `Subtotal  ${money(totals.subtotal)}`,
    `Tax  ${money(totals.tax)}`,
    `Total  ${money(totals.total)}`,
  ].join('\n');
}
