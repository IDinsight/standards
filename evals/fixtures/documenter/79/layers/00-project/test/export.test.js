import assert from 'node:assert/strict';
import test from 'node:test';

import { exportItems } from '../src/export.js';

const items = [
  { sku: 'A1', name: 'Bolt', quantity: 40, updatedAt: '2026-08-30T08:00:00.000Z' },
  { sku: 'A2', name: 'Nut, hex', quantity: 15, updatedAt: '2026-09-01T09:30:00.000Z' },
];

test('exports every item with a header row', () => {
  assert.equal(
    exportItems(items),
    'sku,name,quantity,updatedAt\nA1,Bolt,40,2026-08-30T08:00:00.000Z\nA2,"Nut, hex",15,2026-09-01T09:30:00.000Z\n',
  );
});
