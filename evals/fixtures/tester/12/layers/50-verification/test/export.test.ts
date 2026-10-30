import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { csvCell, exportFileName, toCsv, writeExport } from '../src/export.ts';
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

test('a value containing only a carriage return is quoted', () => {
  assert.equal(csvCell('first line\rsecond line'), '"first line\rsecond line"');
});

test('a value with a comma and double quotes is quoted once with the quotes doubled', () => {
  assert.equal(csvCell('Smith, "Jr" file'), '"Smith, ""Jr"" file"');
});

test('toCsv with no records writes only the header row', () => {
  assert.equal(toCsv([]), 'id,title,owner,status,createdAt\r\n');
});

test('export file names use the UTC time of the export', () => {
  assert.equal(exportFileName(new Date('2026-09-24T11:30:05+02:00')), 'records-20260924T093005Z.csv');
});

test('writeExport creates a missing folder and writes the returned CSV', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'records-write-'));
  try {
    const dir = path.join(root, 'nested', 'exports');
    const records: RecordItem[] = [
      { id: 4, title: 'Insurance renewal 2026', owner: 'marco', status: 'active', createdAt: '2026-04-18T16:20:00Z' },
    ];
    const result = writeExport(dir, records, new Date('2026-09-24T09:00:00Z'));
    assert.equal(result.fileName, 'records-20260924T090000Z.csv');
    assert.equal(result.path, path.join(dir, 'records-20260924T090000Z.csv'));
    assert.equal(result.csv, toCsv(records));
    assert.equal(readFileSync(result.path, 'utf8'), result.csv);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
