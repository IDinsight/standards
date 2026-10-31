import assert from 'node:assert/strict';
import test from 'node:test';

import { daysOverdue, isPaid, outstandingCents } from '../src/billing/invoices.js';

const invoice = { number: 'INV-0900', dueDate: '2026-08-01', totalCents: 12000, payments: [{ amountCents: 2000 }] };

test('counts whole days after the due date', () => {
  assert.equal(daysOverdue(invoice, '2026-08-15'), 14);
  assert.equal(daysOverdue(invoice, '2026-08-02'), 1);
});

test('is not overdue on or before the due date', () => {
  assert.equal(daysOverdue(invoice, '2026-08-01'), 0);
  assert.equal(daysOverdue(invoice, '2026-07-20'), 0);
});

test('outstanding balance subtracts payments', () => {
  assert.equal(outstandingCents(invoice), 10000);
  assert.equal(isPaid(invoice), false);
  assert.equal(isPaid({ ...invoice, payments: [{ amountCents: 12000 }] }), true);
});
