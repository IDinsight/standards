import { lineTotal, orderTotal } from './pricing.js';

function money(cents) {
  return (cents / 100).toFixed(2);
}

export function formatInvoice(order) {
  const rows = [`Invoice ${order.number}`];
  for (const line of order.lines) {
    rows.push(`${line.sku}  ${line.quantity} x ${money(line.unitCents)}  ${money(lineTotal(line))}`);
  }
  rows.push(`Total  ${money(orderTotal(order.lines))}`);
  return rows.join('\n');
}
