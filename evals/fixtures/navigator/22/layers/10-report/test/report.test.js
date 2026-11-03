import assert from 'node:assert/strict';
import test from 'node:test';

import { summaryLines } from '../src/report.js';

test('summaryLines lists each invoice with its total', () => {
  const invoices = [
    { number: 'INV-1001', customer: 'Acme Ltd', lines: [{ quantity: 2, unitPrice: 50 }] },
    { number: 'INV-1002', customer: 'Birch & Co', lines: [{ quantity: 1, unitPrice: 9.99 }] },
  ];
  const lines = summaryLines(invoices, { taxRate: 0.2 });
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^INV-1001\s+Acme Ltd\s+.*120\.00$/);
});
