import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { csvCell, exportFileName, toCsv, writeExport } from '../src/export.ts';
import type { RecordItem } from '../src/records/store.ts';

const root = mkdtempSync(path.join(tmpdir(), 'export-files-'));
after(() => rmSync(root, { recursive: true, force: true }));

const records: RecordItem[] = [
  { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' },
  { id: 3, title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' },
];

test('writeExport creates a missing nested folder and writes the CSV it returns', () => {
  const dir = path.join(root, 'nested', 'out');
  const result = writeExport(dir, records, new Date('2026-09-24T09:00:00Z'));

  assert.equal(result.fileName, 'records-20260924T090000Z.csv');
  assert.equal(result.path, path.join(dir, 'records-20260924T090000Z.csv'));
  assert.equal(result.csv, toCsv(records));
  assert.equal(readFileSync(result.path, 'utf8'), result.csv);
});

test('exportFileName uses the UTC time and drops milliseconds', () => {
  assert.equal(exportFileName(new Date('2026-09-24T23:59:59.999-02:00')), 'records-20260925T015959Z.csv');
});

test('a value containing only a carriage return is quoted', () => {
  assert.equal(csvCell('line one\rline two'), '"line one\rline two"');
});
