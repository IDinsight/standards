import assert from 'node:assert/strict';
import test from 'node:test';

import { ExpenseStore } from '../src/store.js';
import { records } from './sample-records.js';

test('lists expenses oldest first', () => {
  const store = new ExpenseStore({ records });
  assert.deepEqual(store.list().map((record) => record.id), [3, 2, 1]);
});

test('filters by owner and date range', () => {
  const store = new ExpenseStore({ records });
  assert.deepEqual(store.list({ ownerId: 'u1', from: '2026-08-01' }).map((record) => record.id), [1]);
  assert.deepEqual(store.list({ category: 'meals' }).map((record) => record.id), [2]);
});

test('add assigns the next id to the owner', () => {
  const store = new ExpenseStore({ records });
  const added = store.add('u2', {
    date: '2026-08-05', merchant: 'Hotel North', category: 'lodging', description: '', amountCents: 12900,
  });
  assert.equal(added.id, 4);
  assert.equal(store.get(4).ownerId, 'u2');
});
