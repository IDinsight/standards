import assert from 'node:assert/strict';
import test from 'node:test';

import { selectExpired } from '../src/prune.js';

const now = new Date('2026-10-01T00:00:00Z');
const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

test('selects archives older than the retention period', () => {
  const entries = [
    { name: 'a.tar', createdAt: daysAgo(10) },
    { name: 'b.tar', createdAt: daysAgo(3) },
  ];
  assert.deepEqual(selectExpired(entries, now, { retentionDays: 7 }), ['a.tar']);
});

test('keeps an archive exactly at the cutoff', () => {
  const entries = [{ name: 'c.tar', createdAt: daysAgo(7) }];
  assert.deepEqual(selectExpired(entries, now, { retentionDays: 7 }), []);
});
