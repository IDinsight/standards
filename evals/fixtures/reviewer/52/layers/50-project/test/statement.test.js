import assert from 'node:assert/strict';
import test from 'node:test';

import { buildStatement } from '../src/billing/statement.js';

const customer = { name: 'Harbor Supply' };
const invoices = [
  { number: 'INV-1201', dueDate: '2026-12-15', totalCents: 10000, payments: [] },
  { number: 'INV-1202', dueDate: '2026-12-20', totalCents: 8000, payments: [{ amountCents: 3000 }] },
  { number: 'INV-1101', dueDate: '2026-11-01', totalCents: 4000, payments: [{ amountCents: 4000 }] },
];

test('lists only invoices with an outstanding balance', () => {
  const statement = buildStatement(customer, invoices, '2026-11-30');
  assert.deepEqual(statement.lines.map((line) => line.number), ['INV-1201', 'INV-1202']);
});

test('totals the outstanding balances', () => {
  const statement = buildStatement(customer, invoices, '2026-11-30');
  assert.equal(statement.totalCents, 15000);
  assert.equal(statement.statementDate, '2026-11-30');
});
