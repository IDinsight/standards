import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/invoice-export.js';

const items = [
  { name: 'Notebook', unitPrice: 450, quantity: 2 },
  { name: 'Pen', unitPrice: 120, quantity: 5 },
];

test('csv has a header and one row per order', () => {
  const csv = toCsv([{ id: 'A-1', customer: 'Ruiz', items, taxRate: 0.08 }]);
  assert.equal(csv, 'order_id,customer,subtotal,tax,total\nA-1,Ruiz,1500,120,1620');
});
