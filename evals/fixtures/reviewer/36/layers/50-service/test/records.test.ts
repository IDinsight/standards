import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseFilter } from '../src/records/filter.ts';
import { RecordStore, type RecordItem } from '../src/records/store.ts';

const records: RecordItem[] = [
  { id: 3, tenantId: 'northwind', title: 'Budget review', owner: 'dana', status: 'archived', createdAt: '2026-01-10T09:00:00Z' },
  { id: 1, tenantId: 'northwind', title: 'Lease agreement', owner: 'dana', status: 'active', createdAt: '2026-01-02T09:00:00Z' },
  { id: 2, tenantId: 'harbor', title: 'Vendor checklist', owner: 'marco', status: 'active', createdAt: '2026-01-05T09:00:00Z' },
];

test('list returns every record ordered by id', () => {
  const store = new RecordStore(records);
  assert.deepEqual(store.list().map((record) => record.id), [1, 2, 3]);
});

test('list limits records to one tenant', () => {
  const store = new RecordStore(records);
  assert.deepEqual(store.list({ tenantId: 'harbor' }).map((record) => record.id), [2]);
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
  assert.equal(store.list()[0].title, 'Lease agreement');
});

test('parseFilter keeps known parameters and ignores blanks', () => {
  assert.deepEqual(parseFilter({ status: 'archived', owner: ' dana ', q: '', page: '2' }), { status: 'archived', owner: 'dana' });
});

test('parseFilter rejects an unknown status', () => {
  assert.throws(() => parseFilter({ status: 'deleted' }), { status: 400 });
});
