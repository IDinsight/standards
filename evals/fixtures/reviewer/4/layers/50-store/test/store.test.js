import assert from 'node:assert/strict';
import { test } from 'node:test';

import { RecordStore } from '../src/store.js';

function sample() {
  const store = new RecordStore();
  store.add({ id: 3, title: 'Budget review', owner: 'dana', status: 'archived' });
  store.add({ id: 1, title: 'Lease agreement', owner: 'dana', status: 'active' });
  store.add({ id: 2, title: 'Vendor checklist', owner: 'li', status: 'active' });
  return store;
}

test('list returns every record ordered by id', () => {
  assert.deepEqual(sample().list().map((record) => record.id), [1, 2, 3]);
});

test('list filters by status and owner together', () => {
  assert.deepEqual(sample().list({ status: 'active', owner: 'dana' }).map((record) => record.id), [1]);
});

test('add rejects a duplicate id', () => {
  assert.throws(() => sample().add({ id: 2, title: 'Copy', owner: 'li', status: 'active' }), /record 2 already exists/);
});
