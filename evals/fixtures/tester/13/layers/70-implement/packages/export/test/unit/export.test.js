import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { exportRecords } from '../../src/export.js';

const dir = mkdtempSync(path.join(tmpdir(), 'export-unit-'));
after(() => rmSync(dir, { recursive: true, force: true }));

const rows = [
  { id: '1', title: 'Lease agreement, Building B', owner: 'dana', status: 'active', created_at: '2026-03-02T10:15:00Z' },
  { id: '2', title: 'Vendor onboarding checklist', owner: 'li', status: 'active', created_at: '2026-03-09T14:40:00Z' },
  { id: '3', title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', created_at: '2026-04-01T08:05:00Z' },
];

// Records the first word of each statement and answers FETCH from `rows` in
// order. failOnFetch makes that FETCH (1-based) reject.
function fakeDb({ failOnFetch = 0 } = {}) {
  const statements = [];
  let offset = 0;
  let fetches = 0;
  return {
    statements,
    async query(sql) {
      statements.push(sql.split(' ')[0]);
      if (sql.startsWith('INSERT INTO export_jobs')) return { rows: [{ id: '41' }] };
      const fetch = /^FETCH FORWARD (\d+) FROM export_cursor$/.exec(sql);
      if (fetch) {
        fetches += 1;
        if (fetches === failOnFetch) throw new Error('canceling statement due to statement timeout');
        const batch = rows.slice(offset, offset + Number(fetch[1]));
        offset += batch.length;
        return { rows: batch };
      }
      return { rows: [] };
    },
  };
}

test('rows are fetched in batches and written after the header', async () => {
  const db = fakeDb();
  const target = path.join(dir, 'batched.csv');
  const result = await exportRecords(db, {}, target, { batchSize: 2 });

  assert.deepEqual(result, { jobId: 41, path: target, rowCount: 3 });
  assert.deepEqual(db.statements, ['BEGIN', 'INSERT', 'DECLARE', 'FETCH', 'FETCH', 'CLOSE', 'UPDATE', 'COMMIT']);
  assert.equal(
    readFileSync(target, 'utf8'),
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '2,Vendor onboarding checklist,li,active,2026-03-09T14:40:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
  assert.equal(existsSync(`${target}.partial`), false);
});

test('a failed fetch rolls back and leaves no file', async () => {
  const db = fakeDb({ failOnFetch: 2 });
  const target = path.join(dir, 'failed.csv');

  await assert.rejects(exportRecords(db, {}, target, { batchSize: 2 }), /statement timeout/);
  assert.deepEqual(db.statements, ['BEGIN', 'INSERT', 'DECLARE', 'FETCH', 'FETCH', 'ROLLBACK']);
  assert.equal(existsSync(target), false);
  assert.equal(existsSync(`${target}.partial`), false);
});

test('an unwritable output path rolls back', async () => {
  const db = fakeDb();
  const target = path.join(dir, 'missing-folder', 'out.csv');

  await assert.rejects(exportRecords(db, {}, target), { code: 'ENOENT' });
  assert.deepEqual(db.statements, ['BEGIN', 'INSERT', 'DECLARE', 'ROLLBACK']);
});

test('an unknown status is rejected before the transaction starts', async () => {
  const db = fakeDb();

  await assert.rejects(exportRecords(db, { status: 'deleted' }, path.join(dir, 'x.csv')), /unknown status: deleted/);
  assert.deepEqual(db.statements, []);
});
