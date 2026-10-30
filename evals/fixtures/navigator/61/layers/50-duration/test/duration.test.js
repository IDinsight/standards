import assert from 'node:assert/strict';
import test from 'node:test';

import { parseDuration } from '../src/duration.js';

test('reads hours', () => {
  assert.equal(parseDuration('2h'), 120);
});

test('reads minutes', () => {
  assert.equal(parseDuration('45m'), 45);
});

test('reads hours and minutes', () => {
  assert.equal(parseDuration('1h30m'), 90);
});

test('rejects a bare number', () => {
  assert.throws(() => parseDuration('90'), /invalid duration/);
});

test('rejects a unit without a number', () => {
  assert.throws(() => parseDuration('h'), /invalid duration/);
});
