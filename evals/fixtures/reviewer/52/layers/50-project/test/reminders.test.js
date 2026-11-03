import assert from 'node:assert/strict';
import test from 'node:test';

import { invoicesNeedingReminder } from '../src/billing/reminders.js';

test('reminds unpaid invoices at least a week overdue', () => {
  const invoices = [
    { number: 'INV-1', dueDate: '2026-08-01', totalCents: 5000, payments: [] },
    { number: 'INV-2', dueDate: '2026-08-05', totalCents: 5000, payments: [] },
    { number: 'INV-3', dueDate: '2026-07-01', totalCents: 5000, payments: [{ amountCents: 5000 }] },
  ];
  assert.deepEqual(invoicesNeedingReminder(invoices, '2026-08-08'), ['INV-1']);
});
