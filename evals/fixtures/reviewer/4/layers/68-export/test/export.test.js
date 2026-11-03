import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { csvField, formatCsv } from '../src/csv.js';
import { exportRecords } from '../src/export.js';
import { importRecords } from '../src/import.js';
import { RecordStore } from '../src/store.js';

const fixture = readFileSync(new URL('./fixtures/records.csv', import.meta.url), 'utf8');

test('plain values and numbers are written unquoted', () => {
  assert.equal(csvField('Insurance renewal 2026'), 'Insurance renewal 2026');
  assert.equal(csvField(42), '42');
});

test('commas and double quotes are quoted, with quotes doubled', () => {
  assert.equal(csvField('Lease agreement, Building B'), '"Lease agreement, Building B"');
  assert.equal(csvField('Q2 "priority" accounts review'), '"Q2 ""priority"" accounts review"');
});

test('line breaks are quoted', () => {
  assert.equal(csvField('first line\nsecond line'), '"first line\nsecond line"');
  assert.equal(csvField('first line\r\nsecond line'), '"first line\r\nsecond line"');
});

test('every row ends with CRLF', () => {
  assert.equal(formatCsv([['a', 'b'], ['c', 'd']]), 'a,b\r\nc,d\r\n');
});

test('exports the filtered records in id order under a header row', () => {
  const store = new RecordStore();
  store.add({ id: 9, title: 'Archive index', owner: 'dana', status: 'archived' });
  store.add({ id: 7, title: 'Budget, draft', owner: 'li', status: 'active' });
  store.add({ id: 8, title: 'Badge audit', owner: 'li', status: 'active' });
  assert.equal(
    exportRecords(store, { status: 'active', owner: 'li' }),
    'id,title,owner,status\r\n7,"Budget, draft",li,active\r\n8,Badge audit,li,active\r\n',
  );
});

test('exporting the imported sample file reproduces it exactly', () => {
  const store = new RecordStore();
  importRecords(store, fixture);
  assert.equal(exportRecords(store), fixture);
});
