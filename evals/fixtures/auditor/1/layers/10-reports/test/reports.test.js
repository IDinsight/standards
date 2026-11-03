import assert from 'node:assert/strict';
import test from 'node:test';

import { parseKeys } from '../src/auth.js';
import { createHandler } from '../src/router.js';
import { ExpenseStore } from '../src/store.js';
import { records } from './sample-records.js';

const keys = parseKeys('k-admin:u0:admin,k-ana:u1:member');
const report = (key, query) => createHandler({ store: new ExpenseStore({ records }), keys })({
  method: 'GET', path: '/reports/monthly', query, headers: { 'x-api-key': key },
});

test('admins get totals for everyone in the month', () => {
  const body = JSON.parse(report('k-admin', { month: '2026-08' }).body);
  assert.equal(body.count, 2);
  assert.equal(body.totalCents, 7350);
  assert.equal(body.total, '73.50');
  assert.equal(body.byCategory.find((entry) => entry.category === 'meals').totalCents, 3150);
});

test('members get only their own totals', () => {
  const body = JSON.parse(report('k-ana', { month: '2026-08' }).body);
  assert.equal(body.count, 1);
  assert.equal(body.totalCents, 4200);
});

test('rejects a malformed month', () => {
  assert.equal(report('k-admin', { month: '2026-13' }).status, 400);
});
