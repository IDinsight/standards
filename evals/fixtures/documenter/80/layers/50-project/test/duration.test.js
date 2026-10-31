import assert from 'node:assert/strict';
import test from 'node:test';

import { parseDuration } from '../src/duration.js';

test('parses compound durations', () => {
  assert.equal(parseDuration('1m30s'), 90_000);
  assert.equal(parseDuration('2h15m'), 8_100_000);
});

test('parses milliseconds and fractions', () => {
  assert.equal(parseDuration('500ms'), 500);
  assert.equal(parseDuration('1.5h'), 5_400_000);
});

test('rejects malformed input', () => {
  assert.throws(() => parseDuration('abc'), TypeError);
  assert.throws(() => parseDuration(''), TypeError);
  assert.throws(() => parseDuration('10 s'), TypeError);
});
