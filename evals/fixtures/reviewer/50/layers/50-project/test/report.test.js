import assert from 'node:assert/strict';
import test from 'node:test';

import { formatReport } from '../src/report.js';

test('formats one row per low-stock item', () => {
  const items = [
    { sku: 'A-1', name: 'USB-C cable', category: 'cables', quantity: 2 },
    { sku: 'M-1', name: 'Monitor arm', category: 'mounts', quantity: 9 },
  ];
  assert.equal(formatReport(items), 'A-1\tUSB-C cable\t2');
});

test('reports when nothing is low', () => {
  const items = [{ sku: 'M-1', name: 'Monitor arm', category: 'mounts', quantity: 9 }];
  assert.equal(formatReport(items), 'No items below reorder level.');
});
