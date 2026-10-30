import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatAmount, toCsv } from '../src/exports/csv.js';

test('amounts are written in currency units with two decimals', () => {
  assert.equal(formatAmount(125000), '1250.00');
  assert.equal(formatAmount(9905), '99.05');
  assert.equal(formatAmount(7), '0.07');
});

test('customer names containing commas or quotes are quoted', () => {
  const lines = toCsv([
    { id: 1, customer: 'Smith, Jones & Co', amountCents: 100, issuedOn: '2026-09-01' },
    { id: 2, customer: 'The "Corner" Shop', amountCents: 250, issuedOn: '2026-09-02' },
  ]).split('\r\n');
  assert.equal(lines[1], '1,"Smith, Jones & Co",1.00,2026-09-01');
  assert.equal(lines[2], '2,"The ""Corner"" Shop",2.50,2026-09-02');
});

test('toCsv writes a header and one CRLF-terminated row per invoice', () => {
  assert.equal(
    toCsv([{ id: 5, customer: 'Acme', amountCents: 9900, issuedOn: '2026-09-01' }]),
    'invoice_id,customer,amount,issued_on\r\n5,Acme,99.00,2026-09-01\r\n',
  );
});
