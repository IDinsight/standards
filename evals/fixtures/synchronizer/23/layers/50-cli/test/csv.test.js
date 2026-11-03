import assert from 'node:assert/strict';
import { test } from 'node:test';

import { csvCell, toCsv } from '../src/csv.js';

test('plain values are written unquoted', () => {
  assert.equal(csvCell('Insurance renewal 2026'), 'Insurance renewal 2026');
  assert.equal(csvCell(4), '4');
});

test('commas, quotes, and line breaks are quoted', () => {
  assert.equal(csvCell('Lease agreement, Building B'), '"Lease agreement, Building B"');
  assert.equal(csvCell('Q2 "priority" accounts review'), '"Q2 ""priority"" accounts review"');
  assert.equal(csvCell('first line\nsecond line'), '"first line\nsecond line"');
});

test('toCsv writes a header and CRLF-terminated rows', () => {
  const list = [{ id: 9, title: 'Archive index', owner: 'dana', status: 'archived', createdAt: '2026-02-11T15:30:00Z' }];
  assert.equal(toCsv(list), 'id,title,owner,status,createdAt\r\n9,Archive index,dana,archived,2026-02-11T15:30:00Z\r\n');
});
