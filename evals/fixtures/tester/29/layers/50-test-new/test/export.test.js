import assert from 'node:assert/strict';
import test from 'node:test';

import { ordersToCsv } from '../src/export.js';

test('header row and one row per order', () => {
  const csv = ordersToCsv([
    { id: 1, customer: 'Alder', status: 'pending', total: 1999, createdAt: '2026-08-30T08:15:00Z' },
    { id: 2, customer: 'Birch', status: 'paid', total: 4250, createdAt: '2026-09-01T10:00:00Z' },
  ]);
  assert.deepEqual(csv.split('\r\n'), [
    'id,customer,status,total,created_at',
    '1,Alder,pending,19.99,2026-08-30T08:15:00Z',
    '2,Birch,paid,42.50,2026-09-01T10:00:00Z',
    '',
  ]);
});

test('empty export still has the header row', () => {
  assert.equal(ordersToCsv([]), 'id,customer,status,total,created_at\r\n');
});

test('fields with commas, quotes, or line breaks are quoted', () => {
  const csv = ordersToCsv([
    { id: 3, customer: 'Cedar, "North"\nBranch', status: 'shipped', total: 5, createdAt: '2026-09-02T12:00:00Z' },
  ]);
  assert.equal(csv.split('\r\n')[1], '3,"Cedar, ""North""\nBranch",shipped,0.05,2026-09-02T12:00:00Z');
});
