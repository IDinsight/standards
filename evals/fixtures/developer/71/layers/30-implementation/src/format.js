import { computeTotals } from './totals.js';

const money = (cents) => (cents / 100).toFixed(2);

export function renderInvoice(invoice) {
  const totals = computeTotals(invoice.lines, {
    taxRate: invoice.taxRate,
    discountCents: invoice.discountCents ?? 0,
  });
  const rows = invoice.lines.map(
    (line) => `${line.description}  ${line.quantity} x ${money(line.unitPriceCents)}`,
  );
  const summary = [`Subtotal  ${money(totals.subtotal)}`];
  if (totals.discount > 0) summary.push(`Discount  -${money(totals.discount)}`);
  summary.push(`Tax  ${money(totals.tax)}`, `Total  ${money(totals.total)}`);
  return [...rows, ...summary].join('\n');
}
