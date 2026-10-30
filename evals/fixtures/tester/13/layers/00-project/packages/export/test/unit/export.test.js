import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { exportRecords } from '../../src/export.js';

const dir = mkdtempSync(path.join(tmpdir(), 'export-unit-'));
after(() => rmSync(dir, { recursive: true, force: true }));

test('exportRecords writes the header and one line per listed record', async () => {
  const db = {
    async query() {
      return {
        rows: [
          { id: '1', title: 'Lease agreement, Building B', owner: 'dana', status: 'active', created_at: '2026-03-02T10:15:00Z' },
          { id: '3', title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', created_at: '2026-04-01T08:05:00Z' },
        ],
      };
    },
  };
  const target = path.join(dir, 'records.csv');
  assert.deepEqual(await exportRecords(db, { owner: 'dana' }, target), { path: target, rowCount: 2 });
  assert.equal(
    readFileSync(target, 'utf8'),
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
});
