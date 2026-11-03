import assert from 'node:assert/strict';
import test from 'node:test';

import { parseInvoices } from '../src/parse.js';

test('parses lines and skips blanks and comments', () => {
  const text = '# id,customer,amount\n1, Acme, 100\n\n2,Zeta,50.5\n';
  assert.deepEqual(parseInvoices(text), [
    { id: '1', customer: 'Acme', amount: 100 },
    { id: '2', customer: 'Zeta', amount: 50.5 },
  ]);
});

test('rejects a line without a numeric amount', () => {
  assert.throws(() => parseInvoices('3,Acme,ten'), /Invalid invoice line/);
});
