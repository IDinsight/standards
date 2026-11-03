import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { handle } from '../src/router.js';
import { resetStore } from '../src/store.js';

beforeEach(() => resetStore());

test('creates a draft report with a trimmed title', () => {
  const res = handle('POST', '/reports', { title: '  Q3 revenue ', rows: [{ region: 'EU', total: 12 }] });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, title: 'Q3 revenue', status: 'draft', rows: [{ region: 'EU', total: 12 }] });
});

test('rejects a report without a title', () => {
  assert.deepEqual(handle('POST', '/reports', { title: '   ' }), { status: 400, body: { error: 'title is required' } });
});

test('lists reports filtered by status', () => {
  handle('POST', '/reports', { title: 'Q3 revenue' });
  handle('POST', '/reports', { title: 'Churn' });
  handle('POST', '/reports/2/publish');
  assert.deepEqual(handle('GET', '/reports?status=published').body, {
    reports: [{ id: 2, title: 'Churn', status: 'published' }],
  });
  assert.equal(handle('GET', '/reports?status=archived').status, 400);
});

test('returns 404 for an unknown report', () => {
  assert.deepEqual(handle('GET', '/reports/9'), { status: 404, body: { error: 'report not found' } });
});

test('returns 400 for a malformed report id', () => {
  assert.equal(handle('GET', '/reports/abc').status, 400);
});

test('limits returned rows', () => {
  handle('POST', '/reports', { title: 'Regions', rows: [{ r: 'EU' }, { r: 'US' }, { r: 'APAC' }] });
  assert.deepEqual(handle('GET', '/reports/1/rows?limit=2').body, { rows: [{ r: 'EU' }, { r: 'US' }], total: 3 });
  assert.equal(handle('GET', '/reports/1/rows?limit=0').status, 400);
});

test('publishing twice conflicts', () => {
  handle('POST', '/reports', { title: 'Churn' });
  assert.equal(handle('POST', '/reports/1/publish').status, 200);
  assert.equal(handle('POST', '/reports/1/publish').status, 409);
});
