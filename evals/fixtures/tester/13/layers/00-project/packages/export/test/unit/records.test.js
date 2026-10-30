import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filterClause, listRecords } from '../../src/records.js';

test('no filters or blank filters give no WHERE clause', () => {
  assert.equal(filterClause({}), '');
  assert.equal(filterClause({ status: ' ', q: '' }), '');
});

test('status and owner combine with AND and quotes are escaped', () => {
  assert.equal(filterClause({ status: 'active', owner: "O'Neil" }), "WHERE status = 'active' AND owner = 'O''Neil'");
});

test('title search uses ILIKE with LIKE wildcards escaped', () => {
  assert.equal(filterClause({ q: '50%' }), String.raw`WHERE title ILIKE E'%50\\%%'`);
});

test('an unknown status is rejected', () => {
  assert.throws(() => filterClause({ status: 'deleted' }), { name: 'RangeError', message: 'unknown status: deleted' });
});

test('listRecords maps rows to records', async () => {
  const seen = [];
  const db = {
    async query(sql) {
      seen.push(sql);
      return { rows: [{ id: '4', title: 'Insurance renewal 2026', owner: 'marco', status: 'active', created_at: '2026-04-18T16:20:00Z' }] };
    },
  };
  assert.deepEqual(await listRecords(db, { owner: 'marco' }), [
    { id: 4, title: 'Insurance renewal 2026', owner: 'marco', status: 'active', createdAt: '2026-04-18T16:20:00Z' },
  ]);
  assert.match(seen[0], /FROM records WHERE owner = 'marco' ORDER BY id$/);
});
