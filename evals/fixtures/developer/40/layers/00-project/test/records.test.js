import assert from 'node:assert/strict';
import test from 'node:test';

import { RecordStore } from '../src/records.js';

test('create assigns increasing ids', () => {
  const store = new RecordStore();
  const a = store.create({ title: 'A', owner: 'kim', status: 'open' });
  const b = store.create({ title: 'B', owner: 'kim', status: 'open' });
  assert.equal(a.id, 1);
  assert.equal(b.id, 2);
});

test('get returns updated fields after a cached read', () => {
  const store = new RecordStore();
  const record = store.create({ title: 'A', owner: 'kim', status: 'open' });
  store.get(record.id);
  store.update(record.id, { status: 'closed' });
  assert.equal(store.get(record.id).status, 'closed');
});

test('list filters by status', () => {
  const store = new RecordStore();
  store.create({ title: 'A', owner: 'kim', status: 'open' });
  store.create({ title: 'B', owner: 'lee', status: 'closed' });
  assert.deepEqual(store.list({ status: 'open' }).map((record) => record.title), ['A']);
});
