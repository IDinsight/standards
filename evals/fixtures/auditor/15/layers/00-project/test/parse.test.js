import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCsv } from '../src/parse.js';

test('reads the header and rows', () => {
  const { header, rows } = parseCsv('a,b\n1,2\n3,4\n');
  assert.deepEqual(header, ['a', 'b']);
  assert.deepEqual(rows, [{ a: '1', b: '2' }, { a: '3', b: '4' }]);
});

test('uses the given delimiter and trims cells', () => {
  const { rows } = parseCsv('a;b\n 1 ; 2 \n', ';');
  assert.deepEqual(rows, [{ a: '1', b: '2' }]);
});

test('skips blank lines', () => {
  assert.equal(parseCsv('a\n\n1\n\n').rows.length, 1);
});
