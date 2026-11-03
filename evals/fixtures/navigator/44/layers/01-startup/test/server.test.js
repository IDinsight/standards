import assert from 'node:assert/strict';
import test from 'node:test';

import { route } from '../src/server.js';
import { createStore } from '../src/store.js';

test('GET /orders returns the orders as JSON', () => {
  const result = route('GET', '/orders', createStore());
  assert.equal(result.status, 200);
  assert.equal(result.type, 'application/json');
  assert.deepEqual(JSON.parse(result.body).map((order) => order.id), [1003, 1002, 1001]);
});

test('unknown paths return 404', () => {
  assert.equal(route('GET', '/nope', createStore()).status, 404);
});
