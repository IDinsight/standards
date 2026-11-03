import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ValidationError, parseInvoice, recordInvoice } from '../src/invoices/service.js';
import { fakeDb } from './support/fake-db.js';

test('parseInvoice trims the customer and keeps valid fields', () => {
  assert.deepEqual(
    parseInvoice({ customer: '  Northwind Traders ', amountCents: 125000, issuedOn: '2026-08-31' }),
    { customer: 'Northwind Traders', amountCents: 125000, issuedOn: '2026-08-31' },
  );
});

test('parseInvoice rejects a missing customer', () => {
  assert.throws(() => parseInvoice({ customer: '  ', amountCents: 100, issuedOn: '2026-08-31' }), ValidationError);
});

test('parseInvoice rejects amounts that are not positive whole cents', () => {
  for (const amountCents of [0, -5, 12.5, '100']) {
    assert.throws(() => parseInvoice({ customer: 'Acme', amountCents, issuedOn: '2026-08-31' }), ValidationError);
  }
});

test('parseInvoice rejects a malformed issue date', () => {
  assert.throws(() => parseInvoice({ customer: 'Acme', amountCents: 100, issuedOn: '31/08/2026' }), ValidationError);
});

test('recordInvoice inserts the invoice and returns it with its id', async () => {
  const db = fakeDb([{ rows: [], changes: 1, lastInsertRowid: 41 }]);
  const invoice = await recordInvoice(db, { customer: 'Acme', amountCents: 9900, issuedOn: '2026-09-01' });
  assert.deepEqual(invoice, { id: 41, customer: 'Acme', amountCents: 9900, issuedOn: '2026-09-01' });
  assert.deepEqual(db.statements, [{
    sql: 'INSERT INTO invoices (customer, amount_cents, issued_on) VALUES (?, ?, ?)',
    args: ['Acme', 9900, '2026-09-01'],
  }]);
});

test('recordInvoice sends nothing to the database for invalid input', async () => {
  const db = fakeDb();
  await assert.rejects(recordInvoice(db, { customer: 'Acme', amountCents: 0, issuedOn: '2026-09-01' }), ValidationError);
  assert.equal(db.statements.length, 0);
});
