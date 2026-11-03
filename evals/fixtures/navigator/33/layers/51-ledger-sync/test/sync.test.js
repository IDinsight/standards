import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { pushInvoice } from '../src/ledger.js';

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/generated/invoices.json', import.meta.url), 'utf8'));

test('invoices are accepted by the ledger', async () => {
  for (const invoice of fixtures) {
    const created = await pushInvoice(invoice);
    assert.ok(created.externalId);
  }
});
