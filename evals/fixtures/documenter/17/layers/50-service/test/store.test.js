import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseFilter } from '../src/filter.js';
import { RecordStore } from '../src/store.js';

const records = [
  { id: 3, title: 'Budget review', owner: 'dana', status: 'archived', createdAt: '2026-01-10T09:00:00Z' },
  { id: 1, title: 'Lease agreement', owner: 'dana', status: 'active', createdAt: '2026-01-02T09:00:00Z' },
  { id: 2, title: 'Vendor checklist', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' },
];

test('list returns every record ordered by id', () => {
  assert.deepEqual(new RecordStore(records).list().map((record) => record.id), [1, 2, 3]);
});

test('list filters by status and owner together', () => {
  const store = new RecordStore(records);
  assert.deepEqual(store.list({ status: 'active', owner: 'dana' }).map((record) => record.id), [1]);
});

test('title search is case-insensitive', () => {
  assert.deepEqual(new RecordStore(records).list({ q: 'LEASE' }).map((record) => record.id), [1]);
});

test('parseFilter keeps known parameters and ignores blanks', () => {
  assert.deepEqual(parseFilter({ status: 'archived', owner: ' dana ', q: '', page: '2' }), { status: 'archived', owner: 'dana' });
});

test('parseFilter rejects an unknown status', () => {
  assert.throws(() => parseFilter({ status: 'deleted' }), { status: 400 });
});
