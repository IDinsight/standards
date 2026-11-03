import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/reports/summary.js';

test('counts orders and formats total and average', () => {
  assert.deepEqual(summarize([{ amount: 10 }, { amount: 5.5 }]), { count: 2, total: '15.50', average: '7.75' });
});

test('summarizes an empty month', () => {
  assert.deepEqual(summarize([]), { count: 0, total: '0.00', average: '0.00' });
});
