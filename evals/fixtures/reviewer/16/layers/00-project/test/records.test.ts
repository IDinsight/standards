import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseFilter } from '../src/records/filter.ts';
import { RecordStore } from '../src/records/store.ts';
import { seedRecords } from '../src/records/seed.ts';

test('list filters by status and owner together', () => {
  const store = new RecordStore(seedRecords);
  assert.deepEqual(store.list({ status: 'active', owner: 'dana' }).map((r) => r.id), [1]);
});

test('title search is case-insensitive', () => {
  const store = new RecordStore(seedRecords);
  assert.deepEqual(store.list({ q: 'LEASE' }).map((r) => r.id), [1]);
});

test('parseFilter rejects an unknown status', () => {
  assert.throws(() => parseFilter({ status: 'deleted' }), { status: 400 });
});
