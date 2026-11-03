import assert from 'node:assert/strict';
import test from 'node:test';

import { convert } from '../src/convert.js';

test('maps header names to keys', () => {
  assert.deepEqual(convert('date,amount\n2026-01-02,12.50\n'), [{ date: '2026-01-02', amount: '12.50' }]);
});

test('fills short rows with empty strings', () => {
  assert.deepEqual(convert('a,b,c\n1,2\n'), [{ a: '1', b: '2', c: '' }]);
});

test('honours a custom delimiter', () => {
  assert.deepEqual(convert('a;b\nx;y\n', { delimiter: ';' }), [{ a: 'x', b: 'y' }]);
});
