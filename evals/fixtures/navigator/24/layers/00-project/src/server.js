import { createOrder, getOrder, listOrders } from './handlers/orders.js';

export function route(method, path, body) {
  if (method === 'POST' && path === '/orders') return createOrder(body);
  if (method === 'GET' && path === '/orders') return listOrders();
  const match = /^\/orders\/([^/]+)$/.exec(path);
  if (method === 'GET' && match) return getOrder(match[1]);
  return { status: 404, body: { error: 'not found' } };
}
