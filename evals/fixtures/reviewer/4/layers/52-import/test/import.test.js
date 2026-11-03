import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { importRecords } from '../src/import.js';
import { RecordStore } from '../src/store.js';

const fixture = readFileSync(new URL('./fixtures/records.csv', import.meta.url), 'utf8');

test('imports every record in the sample file', () => {
  const store = new RecordStore();
  assert.equal(importRecords(store, fixture), 4);
  assert.deepEqual(store.list().map((record) => record.id), [1, 2, 3, 4]);
});

test('keeps commas and quotes inside quoted titles', () => {
  const store = new RecordStore();
  importRecords(store, fixture);
  assert.equal(store.get(1).title, 'Lease agreement, Building B');
  assert.equal(store.get(3).title, 'Q2 "priority" accounts review');
});

test('rejects a row with the wrong number of fields', () => {
  assert.throws(
    () => importRecords(new RecordStore(), 'id,title,owner,status\r\n5,Budget,li\r\n'),
    /row 2: expected 4 fields, found 3/,
  );
});

test('rejects an unknown status', () => {
  assert.throws(
    () => importRecords(new RecordStore(), 'id,title,owner,status\r\n5,Budget,li,deleted\r\n'),
    /row 2: unknown status deleted/,
  );
});
