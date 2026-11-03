import assert from 'node:assert/strict';
import test from 'node:test';

import { getReport } from '../src/reports.js';
import { handle } from '../src/routes.js';
import { summarize, summaryDownload } from '../src/summary.js';

test('summarize totals numeric columns', () => {
  const summary = summarize(getReport('weekly-signups'));
  assert.equal(summary.rowCount, 3);
  assert.deepEqual(summary.totals, { signups: 897 });
});

test('summary download is a JSON attachment', () => {
  const response = summaryDownload(getReport('weekly-signups'));
  assert.equal(response.headers['Content-Type'], 'application/json');
  assert.equal(response.headers['Content-Disposition'], 'attachment; filename="weekly-signups-2026-09-21.json"');
});

test('unknown report returns 404', () => {
  assert.equal(handle('GET', '/reports/missing/summary').status, 404);
});
