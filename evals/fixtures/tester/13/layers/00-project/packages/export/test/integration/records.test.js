import assert from 'node:assert/strict';
import { test } from 'node:test';

import { listRecords } from '../../src/records.js';
import { withDatabase } from './helpers.js';

test('listRecords returns every record in id order', () => withDatabase(async (db) => {
  const records = await listRecords(db, {});
  assert.deepEqual(records.map((record) => record.id), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(records[0], { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' });
}));

test('listRecords applies status, owner, and title filters', () => withDatabase(async (db) => {
  assert.deepEqual((await listRecords(db, { status: 'active', owner: 'marco' })).map((record) => record.id), [4, 6]);
  assert.deepEqual((await listRecords(db, { q: 'REVIEW' })).map((record) => record.id), [3]);
}));
