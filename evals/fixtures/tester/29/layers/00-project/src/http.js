import { formatCents } from './money.js';
import { STATUSES } from './orders.js';

function badRequest(message) {
  return {
    status: 400,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ error: message }),
  };
}

function unknownStatus(query) {
  return query.status !== undefined && !STATUSES.includes(query.status);
}

export function handleOrders(store, query = {}) {
  if (unknownStatus(query)) return badRequest(`unknown status: ${query.status}`);
  const orders = store.list({ status: query.status }).map((order) => ({ ...order, total: formatCents(order.total) }));
  return { status: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(orders) };
}
