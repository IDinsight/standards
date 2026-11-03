import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import { exportFileName, toCsv } from '../src/export.ts';
import type { RecordItem } from '../src/records/store.ts';

const records: RecordItem[] = [
  { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' },
  { id: 3, title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' },
];

test('toCsv encodes every field of every record', () => {
  const cell = mock.fn((value: string | number) => String(value));
  toCsv(records, cell);
  assert.equal(cell.mock.callCount(), 10);
});

test('titles with commas and double quotes go through the cell encoder', () => {
  const cell = mock.fn((value: string | number) => String(value));
  toCsv(records, cell);
  const encoded = cell.mock.calls.map((call) => call.arguments[0]);
  assert.ok(encoded.includes('Lease agreement, Building B'));
  assert.ok(encoded.includes('Q2 "priority" accounts review'));
});

test('toCsv writes a header row and one CRLF-terminated row per record', () => {
  const csv = toCsv(records, mock.fn(() => 'x'));
  assert.equal(csv, 'id,title,owner,status,createdAt\r\nx,x,x,x,x\r\nx,x,x,x,x\r\n');
});

test('export file names use the UTC time of the export', () => {
  assert.equal(exportFileName(new Date('2026-09-24T09:00:00Z')), 'records-20260924T090000Z.csv');
});
