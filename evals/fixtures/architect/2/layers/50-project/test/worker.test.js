import assert from 'node:assert/strict';
import test from 'node:test';

import { createWorkerSession } from '../worker/src/api-session.js';
import { runNightlyReport } from '../worker/src/report-job.js';
import { connect, createTestApp } from './helpers.js';

const workerSession = (handle) => createWorkerSession({
  baseUrl: 'http://api.internal', username: 'report-worker', password: 'worker pass', fetch: connect(handle),
});

test('the nightly report posts totals by category for the period', async () => {
  const { handle, expenses, reports } = createTestApp();
  expenses.push(
    { id: 1, userId: 1, amountCents: 1200, category: 'travel', date: '2026-08-03', note: '' },
    { id: 2, userId: 1, amountCents: 800, category: 'meals', date: '2026-08-04', note: '' },
    { id: 3, userId: 2, amountCents: 300, category: 'travel', date: '2026-08-30', note: '' },
    { id: 4, userId: 2, amountCents: 999, category: 'travel', date: '2026-09-01', note: '' },
  );
  const report = await runNightlyReport({ api: workerSession(handle), period: '2026-08' });
  assert.deepEqual(report.totals, { travel: 1500, meals: 800 });
  assert.equal(report.count, 3);
  assert.equal(reports.length, 1);
});

test('the worker signs in again when its session has expired', async () => {
  const { handle, clock, config, audit } = createTestApp();
  const api = workerSession(handle);
  await api.get('/expenses');
  clock.value += (config.sessionTtlSeconds + 1) * 1000;
  await api.get('/expenses');
  assert.equal(audit.entries.filter((entry) => entry.event === 'login').length, 2);
});
