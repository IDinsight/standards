import { all, find, insert } from '../store.js';

export function createOrder(body) {
  if (!body || typeof body.customer !== 'string' || body.customer.trim() === '') {
    return { status: 400, body: { error: 'customer is required' } };
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { status: 400, body: { error: 'items must be a non-empty list' } };
  }
  const order = insert({ customer: body.customer.trim(), items: body.items, status: 'open' });
  return { status: 201, body: order };
}

export function getOrder(id) {
  const order = find(id);
  if (!order) return { status: 404, body: { error: 'not found' } };
  return { status: 200, body: order };
}

export function listOrders(query = {}) {
  const orders = query.status ? all().filter((order) => order.status === query.status) : all();
  return { status: 200, body: orders };
}
