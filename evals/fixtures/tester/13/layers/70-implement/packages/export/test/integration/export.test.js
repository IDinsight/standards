import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { HEADER } from '../../src/csv.js';
import { exportRecords } from '../../src/export.js';
import { withDatabase } from './helpers.js';

test('an export streams the filtered records to the file and records the job', () => withDatabase(async (db) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'export-integration-'));
  try {
    const target = path.join(dir, 'records-dana.csv');
    const result = await exportRecords(db, { owner: 'dana' }, target, { batchSize: 1 });

    assert.equal(result.rowCount, 2);
    assert.equal(
      readFileSync(target, 'utf8'),
      HEADER
        + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
        + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
    );
    const { rows } = await db.query(
      `SELECT filter, file_name, row_count, finished_at IS NOT NULL AS finished FROM export_jobs WHERE id = ${result.jobId}`,
    );
    assert.deepEqual(rows, [{ filter: '{"owner": "dana"}', file_name: 'records-dana.csv', row_count: '2', finished: 't' }]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}));
