import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/routes.js';

test('GET /invoices returns every invoice in snake_case', () => {
  const response = handle('GET', '/invoices');
  assert.equal(response.status, 200);
  const { invoices } = JSON.parse(response.body);
  assert.equal(invoices.length, 4);
  assert.deepEqual(invoices[0], {
    id: 'INV-1001',
    customer: 'Northwind Traders',
    issued_at: '2026-08-03T14:20:00.000Z',
    amount_cents: 125000,
    currency: 'USD',
    status: 'paid',
  });
});

test('GET /invoices filters by status', () => {
  const { invoices } = JSON.parse(handle('GET', '/invoices?status=open').body);
  assert.deepEqual(invoices.map((invoice) => invoice.id), ['INV-1002', 'INV-1003']);
});

test('GET /invoices/{id} returns one invoice or 404', () => {
  assert.equal(JSON.parse(handle('GET', '/invoices/INV-1003').body).currency, 'EUR');
  const missing = handle('GET', '/invoices/INV-9999');
  assert.equal(missing.status, 404);
  assert.deepEqual(JSON.parse(missing.body), { error: 'invoice not found' });
});
