import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/app.js';
import { createSession } from '../src/sessions.js';
import { seed } from '../src/store.js';

seed([{
  id: 1,
  status: 'paid',
  customer: { name: 'Ana Ruiz', email: 'ana@example.com', phone: '555-0101', address: '12 Elm St, Springfield' },
  items: [{ name: 'Mug', quantity: 2, priceCents: 900 }],
}]);

const request = (url, sid) => ({ url, headers: sid ? { cookie: `sid=${sid}` } : {} });

test('admin pages redirect to login without a session', () => {
  const res = handle(request('/admin/orders/1'));
  assert.equal(res.status, 302);
  assert.equal(res.headers.location, '/login?next=%2Fadmin%2Forders%2F1');
});

test('admin pages redirect for non-staff sessions', () => {
  const sid = createSession({ id: 7, role: 'customer' });
  assert.equal(handle(request('/admin/orders/1', sid)).status, 302);
});

test('staff can open an order', () => {
  const sid = createSession({ id: 3, role: 'staff' });
  assert.equal(handle(request('/admin/orders/1', sid)).status, 200);
});

test('health check needs no session', () => {
  assert.equal(handle(request('/health')).status, 200);
});
