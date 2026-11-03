import assert from 'node:assert/strict';
import test from 'node:test';

import { count } from '../src/count.js';

test('counts lines, words, and characters', () => {
  assert.deepEqual(count('one two\nthree\n'), { lines: 2, words: 3, chars: 14 });
});

test('counts a final line without a trailing newline', () => {
  assert.deepEqual(count('a b'), { lines: 1, words: 2, chars: 3 });
});

test('returns zeros for empty input', () => {
  assert.deepEqual(count(''), { lines: 0, words: 0, chars: 0 });
});
