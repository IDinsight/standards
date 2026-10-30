import assert from 'node:assert/strict';
import { test } from 'node:test';

import { RecordStore } from '../src/records/store.js';

const records = [
  { id: 3, title: 'Budget review', owner: 'dana', status: 'archived', createdAt: '2026-01-10T09:00:00Z' },
  { id: 1, title: 'Lease agreement', owner: 'dana', status: 'active', createdAt: '2026-01-02T09:00:00Z' },
  { id: 2, title: 'Vendor checklist', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' },
];

test('list returns every record ordered by id', () => {
  const store = new RecordStore(records);
  assert.deepEqual(store.list().map((record) => record.id), [1, 2, 3]);
});

test('list filters by status and owner together', () => {
  const store = new RecordStore(records);
  assert.deepEqual(store.list({ status: 'active', owner: 'dana' }).map((record) => record.id), [1]);
});

test('title search is case-insensitive', () => {
  const store = new RecordStore(records);
  assert.deepEqual(store.list({ q: 'LEASE' }).map((record) => record.id), [1]);
});

test('returned records are copies', () => {
  const store = new RecordStore(records);
  store.list()[0].title = 'changed';
  assert.equal(store.get(1)?.title, 'Lease agreement');
});
