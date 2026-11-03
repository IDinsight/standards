import assert from 'node:assert/strict';
import test from 'node:test';

import { formatReport } from '../src/report.js';

test('formatReport right-aligns amounts and ends with a total', () => {
  const lines = formatReport([['meals', 18.2], ['travel', 184.5]]).split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines.every((line) => line.length === lines[0].length));
  assert.match(lines[0], /^meals +18\.20$/);
  assert.match(lines[2], /^TOTAL +202\.70$/);
});

test('formatReport prints only the total when there are no expenses', () => {
  assert.match(formatReport([]), /^TOTAL +0\.00$/);
});
