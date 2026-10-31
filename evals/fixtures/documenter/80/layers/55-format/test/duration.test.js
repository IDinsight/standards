import assert from 'node:assert/strict';
import test from 'node:test';

import { formatDuration, parseDuration } from '../src/duration.js';

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

test('formats milliseconds', () => {
  assert.equal(formatDuration(90_000), '1m30s');
  assert.equal(formatDuration(0), '0ms');
  assert.equal(formatDuration(86_400_500), '1d500ms');
  assert.throws(() => formatDuration(-1), RangeError);
});

test('round-trips formatted values', () => {
  for (const value of [1, 999, 61_000, 3_723_004]) {
    assert.equal(parseDuration(formatDuration(value)), value);
  }
});
