import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/api.js';
import { createStore } from '../src/store.js';

const clock = () => new Date('2026-09-21T10:00:00Z');

test('create, issue, and read an invoice', () => {
  const store = createStore();
  const created = handle(store, clock, 'POST', '/invoices', {
    customerId: 'c-9',
    lines: [{ description: 'Support plan', quantity: 2, unitPriceCents: 9900 }],
  });
  assert.equal(created.status, 201);
  const number = created.body.number;
  assert.equal(handle(store, clock, 'POST', '/invoices/' + number + '/issue').status, 200);
  const read = handle(store, clock, 'GET', '/invoices/' + number);
  assert.equal(read.status, 200);
  assert.equal(read.body.status, 'issued');
  assert.equal(read.body.totalCents, 19800);
  assert.equal(read.body.dueDate, '2026-10-21');
});

test('unknown invoice is not found', () => {
  const store = createStore();
  assert.equal(handle(store, clock, 'GET', '/invoices/INV-2026-00099').status, 404);
});
