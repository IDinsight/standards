import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/reports/summary.js';

test('counts orders and sums their amounts', () => {
  assert.deepEqual(summarize([{ amount: 10 }, { amount: 5.5 }]), { count: 2, total: '15.5' });
});

test('summarizes an empty month', () => {
  assert.deepEqual(summarize([]), { count: 0, total: '0' });
});
