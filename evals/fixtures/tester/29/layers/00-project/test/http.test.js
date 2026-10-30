import assert from 'node:assert/strict';
import test from 'node:test';

import { handleOrders } from '../src/http.js';
import { createStore } from '../src/orders.js';

const store = createStore([
  { id: 1, customer: 'Alder & Co', status: 'pending', total: 1999, createdAt: '2026-08-30T08:15:00Z' },
  { id: 2, customer: 'Birch Ltd', status: 'paid', total: 4250, createdAt: '2026-09-01T10:00:00Z' },
]);

test('orders route formats totals', () => {
  const response = handleOrders(store);
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body).map((order) => order.total), ['19.99', '42.50']);
});

test('orders route rejects an unknown status', () => {
  const response = handleOrders(store, { status: 'lost' });
  assert.equal(response.status, 400);
});
