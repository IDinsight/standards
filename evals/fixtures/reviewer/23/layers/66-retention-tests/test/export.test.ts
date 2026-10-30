import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { csvCell, toCsv, writeExport } from '../src/export.ts';
import type { RecordItem } from '../src/records/store.ts';

test('plain values are written unquoted', () => {
  assert.equal(csvCell('Insurance renewal 2026'), 'Insurance renewal 2026');
  assert.equal(csvCell(42), '42');
});

test('values containing a comma are quoted', () => {
  assert.equal(csvCell('Lease agreement, Building B'), '"Lease agreement, Building B"');
});

test('double quotes inside a value are doubled and the value is quoted', () => {
  assert.equal(csvCell('Q2 "priority" accounts review'), '"Q2 ""priority"" accounts review"');
});

test('values containing line breaks are quoted', () => {
  assert.equal(csvCell('first line\nsecond line'), '"first line\nsecond line"');
  assert.equal(csvCell('first line\r\nsecond line'), '"first line\r\nsecond line"');
});

test('toCsv writes a header row and one CRLF-terminated row per record', () => {
  const records: RecordItem[] = [
    { id: 7, title: 'Budget, draft', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' },
    { id: 9, title: 'Archive index', owner: 'dana', status: 'archived', createdAt: '2026-02-11T15:30:00Z' },
  ];
  assert.equal(
    toCsv(records),
    'id,title,owner,status,createdAt\r\n'
      + '7,"Budget, draft",li,active,2026-01-05T09:00:00Z\r\n'
      + '9,Archive index,dana,archived,2026-02-11T15:30:00Z\r\n',
  );
});

test('writeExport keeps an existing export file and writes the next name', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'records-write-'));
  try {
    writeFileSync(path.join(dir, 'records-20260924T090000Z.csv'), 'earlier\r\n');
    const file = writeExport(dir, [], new Date('2026-09-24T09:00:00Z'));
    assert.equal(file.fileName, 'records-20260924T090000Z-2.csv');
    assert.equal(readFileSync(path.join(dir, 'records-20260924T090000Z.csv'), 'utf8'), 'earlier\r\n');
    assert.equal(readFileSync(file.path, 'utf8'), 'id,title,owner,status,createdAt\r\n');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
