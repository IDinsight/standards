import { serializeOrder } from './serialize.js';

// One serialized order per line, each line newline-terminated.
export function exportOrders(orders, { serialize = serializeOrder } = {}) {
  if (orders.length === 0) return '';
  return `${orders.map((order) => serialize(order)).join('\n')}\n`;
}
