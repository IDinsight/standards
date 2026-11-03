import { formatCents } from './money.js';

export function serializeOrder(order) {
  return JSON.stringify({
    id: order.id,
    customer: order.customer,
    total: formatCents(order.totalCents),
    placedAt: new Date(order.placedAt).toISOString(),
    lines: order.lines.map((line) => ({
      sku: line.sku,
      quantity: line.quantity,
      price: formatCents(line.priceCents),
    })),
  });
}
