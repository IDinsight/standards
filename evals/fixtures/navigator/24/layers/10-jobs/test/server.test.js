import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { openOrderCount } from '../src/jobs/reconcile.js';
import { route } from '../src/server.js';
import { reset } from '../src/store.js';

beforeEach(() => reset());

test('POST then GET an order', () => {
  const created = route('POST', '/orders', { customer: 'Lin', items: ['coffee'] });
  assert.equal(created.status, 201);
  assert.equal(route('GET', `/orders/${created.body.id}`).body.customer, 'Lin');
});

test('unknown paths return 404', () => {
  assert.equal(route('GET', '/customers').status, 404);
});

test('openOrderCount counts open orders', () => {
  route('POST', '/orders', { customer: 'Lin', items: ['coffee'] });
  route('POST', '/orders', { customer: 'Ada', items: ['tea'] });
  assert.equal(openOrderCount(), 2);
});
