import assert from 'node:assert/strict';
import test from 'node:test';

import { listOrders } from '../src/orders.js';
import { createStore } from '../src/store.js';

test('lists orders newest first', () => {
  const ids = listOrders(createStore()).map((order) => order.id);
  assert.deepEqual(ids, [1003, 1002, 1001]);
});

test('callers cannot change stored orders through the listing', () => {
  const store = createStore();
  listOrders(store)[0].customer = 'changed';
  assert.notEqual(listOrders(store)[0].customer, 'changed');
});
