import { totals } from './pricing.js';

const HEADER = ['order_id', 'customer', 'subtotal', 'tax', 'total'];

export function invoiceRows(orders) {
  return orders.map((order) => {
    const t = totals(order.items, { taxRate: order.taxRate });
    return [order.id, order.customer, t.subtotal, t.tax, t.total];
  });
}

export function toCsv(orders) {
  const rows = invoiceRows(orders).map((row) => row.join(','));
  return [HEADER.join(','), ...rows].join('\n');
}
