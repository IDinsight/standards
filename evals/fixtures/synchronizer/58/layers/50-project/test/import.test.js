import assert from 'node:assert/strict';
import test from 'node:test';

import { parseStatement } from '../src/parse.js';

test('reads entries in cents', () => {
  const entries = parseStatement('date,description,amount\n2026-08-01,Salary,2400.00\n2026-08-03,Rent,-950.5\n');
  assert.deepEqual(entries, [
    { date: '2026-08-01', description: 'Salary', amount: 240000 },
    { date: '2026-08-03', description: 'Rent', amount: -95050 },
  ]);
});

test('rejects an unexpected header', () => {
  assert.throws(() => parseStatement('when,what,how much\n'), /unexpected header/);
});
