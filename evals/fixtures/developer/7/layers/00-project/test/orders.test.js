import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/app.js';
import { createSession } from '../src/sessions.js';
import { seed } from '../src/store.js';

seed([
  {
    id: 1,
    status: 'paid',
    customer: { name: 'Ana <Ruiz>', email: 'ana@example.com', phone: '555-0101', address: '12 Elm St, Springfield' },
    items: [{ name: 'Mug', quantity: 2, priceCents: 900 }],
  },
  {
    id: 2,
    status: 'shipped',
    customer: { name: 'Lee Park', email: 'lee@example.com', phone: '555-0144', address: '7 Harbor Rd' },
    items: [{ name: 'Apron', quantity: 1, priceCents: 2400 }],
  },
]);

const sid = createSession({ id: 3, role: 'staff' });
const get = (url) => handle({ url, headers: { cookie: `sid=${sid}` } });

test('order page shows customer details and total', () => {
  const res = get('/admin/orders/1');
  assert.equal(res.status, 200);
  assert.match(res.body, /ana@example\.com/);
  assert.match(res.body, /12 Elm St, Springfield/);
  assert.match(res.body, /Total: \$18\.00/);
});

test('order page escapes customer text', () => {
  const res = get('/admin/orders/1');
  assert.match(res.body, /Ana &lt;Ruiz&gt;/);
  assert.doesNotMatch(res.body, /<Ruiz>/);
});

test('unknown order is not found', () => {
  assert.equal(get('/admin/orders/99').status, 404);
});

test('order list links to each order, newest first', () => {
  const { body } = get('/admin/orders');
  assert.ok(body.indexOf('/admin/orders/2') < body.indexOf('/admin/orders/1'));
});
