import assert from 'node:assert/strict';
import test from 'node:test';

import { listHandler } from '../src/handlers.js';
import { createStore } from '../src/records.js';

test('list returns copies of stored records', () => {
  const store = createStore([{ id: 1, title: 'Water point survey' }]);
  const listed = store.list();
  listed[0].title = 'changed';
  assert.equal(store.list()[0].title, 'Water point survey');
});

test('add rejects a duplicate id', () => {
  const store = createStore([{ id: 1, title: 'a' }]);
  assert.throws(() => store.add({ id: 1, title: 'b' }), /already exists/);
});

test('list handler returns JSON', () => {
  const response = listHandler(createStore([{ id: 2, title: 'b' }]))({});
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), [{ id: 2, title: 'b' }]);
});
