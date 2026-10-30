import assert from 'node:assert/strict';
import { test } from 'node:test';

import { seedRecords } from '../src/seed.ts';
import { parseFilter, RecordStore } from '../src/store.ts';

test('list filters by status and owner together, ordered by id', () => {
  const ids = new RecordStore(seedRecords).list({ status: 'active', owner: 'marco' }).map((r) => r.id);
  assert.deepEqual(ids, [4, 6]);
});

test('parseFilter rejects an unknown status', () => {
  assert.throws(() => parseFilter({ status: 'deleted' }), { status: 400 });
});
