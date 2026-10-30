import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { summarize } from '../src/report.js';

const dir = fileURLToPath(new URL('./data', import.meta.url));

test('summarizes record quantities', () => {
  const summary = summarize(dir, ['sku-2001', 'sku-2002']);
  assert.equal(summary.count, 2);
  assert.equal(summary.total, 14);
});
