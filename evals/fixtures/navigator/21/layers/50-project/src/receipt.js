import { lineTotal } from './cart.js';
import { totals } from './pricing.js';

const money = (cents) => `$${(cents / 100).toFixed(2)}`;

export function formatReceipt(order) {
  const lines = order.items.map((item) => `${item.name} x${item.quantity}  ${money(lineTotal(item))}`);
  const t = totals(order.items, { taxRate: order.taxRate });
  lines.push(`Subtotal  ${money(t.subtotal)}`);
  lines.push(`Tax  ${money(t.tax)}`);
  lines.push(`Total  ${money(t.total)}`);
  return lines.join('\n');
}
