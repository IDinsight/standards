import assert from 'node:assert/strict';
import { test } from 'node:test';

import { csvCell, toCsv } from '../src/export.ts';

test('values containing a comma are quoted', () => {
  assert.equal(csvCell('Lease agreement, Building B'), '"Lease agreement, Building B"');
});

test('double quotes and line breaks are quoted, quotes doubled', () => {
  assert.equal(csvCell('Q2 "priority"'), '"Q2 ""priority"""');
  assert.equal(csvCell('a\r\nb'), '"a\r\nb"');
});

test('toCsv writes a header and CRLF-terminated rows', () => {
  const csv = toCsv([{ id: 7, title: 'Budget', owner: 'li', status: 'active', createdAt: '2026-01-05T09:00:00Z' }]);
  assert.equal(csv, 'id,title,owner,status,createdAt\r\n7,Budget,li,active,2026-01-05T09:00:00Z\r\n');
});
