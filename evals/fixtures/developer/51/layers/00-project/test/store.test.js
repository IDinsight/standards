import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore } from '../src/store.js';

test('assigns increasing ids', () => {
  const store = createStore([]);
  assert.equal(store.add({ name: 'A', email: 'a@example.org' }).id, 1);
  assert.equal(store.add({ name: 'B', email: 'b@example.org' }).id, 2);
});

test('list returns copies', () => {
  const store = createStore();
  store.list()[0].name = 'Changed';
  assert.equal(store.list()[0].name, 'Ada Lovelace');
});
