import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.ts';
import { importRecords } from '../src/import.ts';
import { parseCsv } from '../src/parse-csv.ts';
import { RecordStore } from '../src/store.ts';

const HEADER = 'title,owner,status,createdAt\n';

test('valid rows are added and invalid rows are reported', () => {
  const store = new RecordStore();
  const result = importRecords(store, `${HEADER}Budget review,dana,active,2026-02-01T09:00:00Z\nVendor list,,active,2026-02-01T09:00:00Z\n`);
  assert.deepEqual(store.list().map((r) => r.title), ['Budget review']);
  assert.equal(result.report, 'row,reason,title,owner,status,createdAt\n3,owner is required,Vendor list,,active,2026-02-01T09:00:00Z\n');
});

test('the rejection report quotes cells with commas and doubles quotes', () => {
  const result = importRecords(new RecordStore(), `${HEADER}"Budget, ""draft""",li,pending,2026-02-01T09:00:00Z\n`);
  assert.equal(result.report.split('\n')[1], '2,unknown status: pending,"Budget, ""draft""",li,pending,2026-02-01T09:00:00Z');
});

test('rejected cells read back unchanged from the report', () => {
  const cells = ['Q2 "priority", review', 'dana', 'active', 'not a date'];
  const result = importRecords(new RecordStore(), `${HEADER}${cells.map((c) => `"${c.replaceAll('"', '""')}"`).join(',')}\n`);
  assert.deepEqual(parseCsv(result.report)[1], ['2', 'invalid createdAt: not a date', ...cells]);
});

test('viewers cannot import', () => {
  const response = createApp().handle({ method: 'POST', path: '/records/import', query: {}, user: { id: 3, name: 'Vik', role: 'viewer' }, body: HEADER });
  assert.equal(response.status, 403);
});
