import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { createOrder, getOrder, listOrders } from '../src/handlers/orders.js';
import { reset } from '../src/store.js';

beforeEach(() => reset());

test('createOrder stores a trimmed customer and open status', () => {
  const result = createOrder({ customer: ' Ada ', items: ['tea'] });
  assert.equal(result.status, 201);
  assert.deepEqual(result.body, { id: '1', customer: 'Ada', items: ['tea'], status: 'open' });
});

test('createOrder rejects a missing customer', () => {
  assert.equal(createOrder({ items: ['tea'] }).status, 400);
});

test('createOrder rejects an empty item list', () => {
  assert.equal(createOrder({ customer: 'Ada', items: [] }).status, 400);
});

test('getOrder returns 404 for an unknown id', () => {
  assert.equal(getOrder('42').status, 404);
});

test('listOrders filters by status', () => {
  createOrder({ customer: 'Ada', items: ['tea'] });
  assert.equal(listOrders({ status: 'open' }).body.length, 1);
  assert.equal(listOrders({ status: 'closed' }).body.length, 0);
});
