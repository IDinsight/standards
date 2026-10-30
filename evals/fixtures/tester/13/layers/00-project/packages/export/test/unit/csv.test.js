import assert from 'node:assert/strict';
import { test } from 'node:test';

import { HEADER, csvCell, recordLine } from '../../src/csv.js';

test('plain values are written unquoted and null as empty', () => {
  assert.equal(csvCell('Insurance renewal 2026'), 'Insurance renewal 2026');
  assert.equal(csvCell(42), '42');
  assert.equal(csvCell(null), '');
  assert.equal(HEADER, 'id,title,owner,status,createdAt\r\n');
});

test('values containing a comma are quoted', () => {
  assert.equal(csvCell('Lease agreement, Building B'), '"Lease agreement, Building B"');
});

test('double quotes are doubled inside a quoted value', () => {
  assert.equal(csvCell('Q2 "priority" accounts review'), '"Q2 ""priority"" accounts review"');
});

test('values containing line breaks are quoted and records end with CRLF', () => {
  assert.equal(csvCell('first line\nsecond line'), '"first line\nsecond line"');
  assert.equal(
    recordLine({ id: 7, title: 'Budget\r\ndraft', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' }),
    '7,"Budget\r\ndraft",li,active,2026-01-05T09:00:00Z\r\n',
  );
});
