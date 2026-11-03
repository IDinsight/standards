import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CSV_HEADER, csvCell, csvRow } from '../src/csv.ts';

test('plain values are written as they are', () => {
  assert.equal(csvCell('Office move inventory'), 'Office move inventory');
  assert.equal(csvCell(6), '6');
});

test('values with commas, quotes, or line breaks are quoted', () => {
  assert.equal(csvCell('Lease agreement, Building B'), '"Lease agreement, Building B"');
  assert.equal(csvCell('Q2 "priority" review'), '"Q2 ""priority"" review"');
  assert.equal(csvCell('line one\nline two'), '"line one\nline two"');
});

test('csvRow writes the columns in header order and ends with CRLF', () => {
  assert.equal(CSV_HEADER, 'id,title,owner,status,createdAt\r\n');
  assert.equal(
    csvRow({ id: 4, title: 'Insurance renewal 2026', owner: 'marco', status: 'active', createdAt: '2026-04-18T16:20:00Z' }),
    '4,Insurance renewal 2026,marco,active,2026-04-18T16:20:00Z\r\n',
  );
});
