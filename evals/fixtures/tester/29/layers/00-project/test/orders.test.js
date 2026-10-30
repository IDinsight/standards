import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../src/orders.js';

const sample = [
  { id: 2, customer: 'Birch Ltd', status: 'paid', total: 4250, createdAt: '2026-09-01T10:00:00Z' },
  { id: 1, customer: 'Alder & Co', status: 'pending', total: 1999, createdAt: '2026-08-30T08:15:00Z' },
];

test('list returns orders in id order', () => {
  assert.deepEqual(createStore(sample).list().map((order) => order.id), [1, 2]);
});

test('list filters by status', () => {
  assert.deepEqual(createStore(sample).list({ status: 'paid' }).map((order) => order.id), [2]);
});

test('add rejects an unknown status', () => {
  const store = createStore();
  assert.throws(
    () => store.add({ id: 3, customer: 'Cedar', status: 'lost', total: 0, createdAt: '2026-09-02T12:00:00Z' }),
    /unknown status/,
  );
});
