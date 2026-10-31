import assert from 'node:assert/strict';
import test from 'node:test';

import { validate } from '../src/validate.js';

test('accepts consistent rows', () => {
  assert.deepEqual(validate('a,b\n1,2\n3,4\n'), []);
});

test('reports rows with the wrong field count', () => {
  assert.deepEqual(validate('a,b\n1,2\n3\n'), [{ line: 3, message: 'expected 2 fields, found 1' }]);
});

test('reports missing and empty required columns', () => {
  assert.deepEqual(validate('a,b\n1,\n', { required: ['b', 'c'] }), [
    { line: 1, message: 'missing column "c"' },
    { line: 2, message: 'empty value for "b"' },
  ]);
});
