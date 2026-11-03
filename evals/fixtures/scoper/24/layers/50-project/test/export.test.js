import assert from 'node:assert/strict';
import test from 'node:test';

import { render, selectRecords, toCsv } from '../src/export.js';

const records = [
  { date: '2026-09-03', account: 'ops', description: 'Courier', amount: -18.5 },
  { date: '2026-08-30', account: 'ops', description: 'Fuel card', amount: -60 },
  { date: '2026-09-30', account: 'sales', description: 'Invoice 1042, final', amount: 1200 },
];

test('date range is inclusive and output is sorted by date', () => {
  const picked = selectRecords(records, { from: '2026-09-01', to: '2026-09-30' });
  assert.deepEqual(picked.map((record) => record.date), ['2026-09-03', '2026-09-30']);
});

test('account filter matches exactly', () => {
  assert.deepEqual(selectRecords(records, { account: 'sales' }).map((record) => record.amount), [1200]);
});

test('csv quotes fields that contain commas', () => {
  assert.equal(toCsv([records[2]]), 'date,account,description,amount\n2026-09-30,sales,"Invoice 1042, final",1200\n');
});

test('unknown formats are rejected', () => {
  assert.throws(() => render(records, 'xml'), /Unknown format/);
});
