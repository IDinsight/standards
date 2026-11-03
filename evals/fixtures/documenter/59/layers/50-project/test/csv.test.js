import assert from 'node:assert/strict';
import test from 'node:test';

import { invoicesToCsv } from '../src/csv.js';
import { listInvoices } from '../src/invoices.js';

test('CSV export starts with the header row', () => {
  const lines = invoicesToCsv(listInvoices()).split('\n');
  assert.equal(lines[0], 'id,customer,issued_at,amount_cents,currency,status');
  assert.equal(lines[1], 'INV-1001,Northwind Traders,2026-08-03T14:20:00.000Z,125000,USD,paid');
});

test('CSV export quotes fields that contain commas', () => {
  const lines = invoicesToCsv(listInvoices()).split('\n');
  assert.equal(lines[2], 'INV-1002,"Lindqvist, Berg & Co",2026-08-17T09:05:00.000Z,48050,USD,open');
});
