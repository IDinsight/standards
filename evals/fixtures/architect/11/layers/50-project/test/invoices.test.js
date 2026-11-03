import assert from 'node:assert/strict';
import test from 'node:test';

import { createDraft, dueDate, issueInvoice, totalCents } from '../src/invoices.js';
import { createStore } from '../src/store.js';

const lines = [
  { description: 'Consulting', quantity: 3, unitPriceCents: 12000 },
  { description: 'Travel', quantity: 1, unitPriceCents: 4550 },
];

test('drafts get sequential numbers', () => {
  const store = createStore();
  const first = createDraft(store, { customerId: 'c-1', lines }, '2026-09-01');
  const second = createDraft(store, { customerId: 'c-2', lines }, '2026-09-02');
  assert.equal(first.number, 'INV-2026-00001');
  assert.equal(second.number, 'INV-2026-00002');
  assert.equal(first.status, 'draft');
});

test('total and due date follow the issue date', () => {
  const store = createStore();
  const invoice = createDraft(store, { customerId: 'c-1', termsDays: 14, lines }, '2026-09-01');
  issueInvoice(store, invoice.number, '2026-09-20');
  assert.equal(totalCents(invoice), 40550);
  assert.equal(dueDate(invoice), '2026-10-04');
});

test('issuing requires at least one line', () => {
  const store = createStore();
  const empty = createDraft(store, { customerId: 'c-1' }, '2026-09-01');
  assert.throws(() => issueInvoice(store, empty.number, '2026-09-01'), /no lines/);
});
