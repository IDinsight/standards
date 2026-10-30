import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../src/store.js';

test('assigns increasing ids', () => {
  const store = createStore();
  assert.equal(store.add({ name: 'Ada' }).id, 1);
  assert.equal(store.add({ name: 'Grace' }).id, 2);
});

test('lists and fetches records', () => {
  const store = createStore();
  const record = store.add({ name: 'Ada' });
  assert.deepEqual(store.list(), [record]);
  assert.equal(store.get(record.id), record);
  assert.equal(store.get(99), null);
});
