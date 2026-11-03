import assert from 'node:assert/strict';
import { test } from 'node:test';

import { csvCell, exportFileName, toCsv } from '../src/export.ts';
import type { RecordItem } from '../src/records.ts';

const lease: RecordItem = { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' };
const vendor: RecordItem = { id: 2, title: 'Vendor onboarding checklist', owner: 'li', status: 'active', createdAt: '2026-03-09T14:40:00Z' };

test('plain values are written unquoted', () => {
  assert.equal(csvCell('Vendor onboarding checklist'), 'Vendor onboarding checklist');
});

test('numbers are written in decimal', () => {
  assert.equal(csvCell(42), '42');
  assert.equal(csvCell(0), '0');
});

test('empty values stay empty', () => {
  assert.equal(csvCell(''), '');
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

test('non-ASCII text is written as it is', () => {
  assert.equal(csvCell('Café inventory Zürich'), 'Café inventory Zürich');
});

test('leading and trailing spaces are kept without quoting', () => {
  assert.equal(csvCell('  padded  '), '  padded  ');
});

test('toCsv writes a header row and one CRLF-terminated row per record', () => {
  assert.equal(
    toCsv([lease, vendor]),
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '2,Vendor onboarding checklist,li,active,2026-03-09T14:40:00Z\r\n',
  );
});

test('toCsv of an empty list is the header row only', () => {
  assert.equal(toCsv([]), 'id,title,owner,status,createdAt\r\n');
});

test('toCsv writes columns in a fixed order', () => {
  const shuffled: RecordItem = { createdAt: '2026-05-06T11:00:00Z', status: 'archived', owner: 'li', title: 'Data retention policy', id: 5 };
  assert.equal(toCsv([shuffled]).split('\r\n')[1], '5,Data retention policy,li,archived,2026-05-06T11:00:00Z');
});

test('exportFileName stamps the UTC time', () => {
  assert.equal(exportFileName(new Date('2026-09-24T11:30:05+02:00')), 'records-20260924T093005Z.csv');
});
