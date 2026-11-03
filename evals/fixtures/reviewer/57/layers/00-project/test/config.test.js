import assert from 'node:assert/strict';
import test from 'node:test';

import { readConfig } from '../src/config.js';

test('uses defaults when only a file is given', () => {
  assert.deepEqual(readConfig(['in.csv'], {}), {
    delimiter: ',', currency: 'USD', skipHeader: true, input: 'in.csv',
  });
});

test('reads the currency from the environment unless the option is given', () => {
  assert.equal(readConfig(['in.csv'], { LEDGER_CURRENCY: 'EUR' }).currency, 'EUR');
  assert.equal(readConfig(['in.csv', '--currency', 'GBP'], { LEDGER_CURRENCY: 'EUR' }).currency, 'GBP');
});

test('rejects unknown options, long delimiters, and a missing file', () => {
  assert.throws(() => readConfig(['in.csv', '--sep', ';']), /unknown option --sep/);
  assert.throws(() => readConfig(['in.csv', '--delimiter', ';;']), /one character/);
  assert.throws(() => readConfig([]), /missing input file/);
});
