import assert from 'node:assert/strict';
import test from 'node:test';

import { renderReceipt } from '../src/receipt.js';

test('renders lines and a total at printer width', () => {
  const out = renderReceipt([
    { label: 'Coffee', cents: 350 },
    { label: 'Bagel', cents: 275 },
  ]);
  const lines = out.split('\n');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^Coffee\s+\$3\.50$/);
  assert.match(lines[3], /^Total\s+\$6\.25$/);
  assert.ok(lines.every((line) => line.length === 32));
});
