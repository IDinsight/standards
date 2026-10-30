import { all, find, insert } from '../../store.js';

const json = (status, body) => ({ status, body });

function validate(body) {
  if (!body || typeof body.customer !== 'string' || body.customer.trim() === '') {
    return 'customer is required';
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return 'items must be a non-empty list';
  }
  return null;
}

export function createOrder(body) {
  const error = validate(body);
  if (error) return json(400, { error });
  return json(201, insert({ customer: body.customer.trim(), items: body.items, status: 'open' }));
}

export function getOrder(id) {
  const order = find(id);
  return order ? json(200, order) : json(404, { error: 'not found' });
}

export function listOrders(query = {}) {
  const orders = all();
  return json(200, query.status ? orders.filter((order) => order.status === query.status) : orders);
}
