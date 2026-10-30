import assert from 'node:assert/strict';
import test from 'node:test';

import { parseLine } from '../src/parse.js';

test('parses a plain entry', () => {
  const entry = parseLine('2026-09-20 45m code review');
  assert.equal(entry.date, '2026-09-20');
  assert.equal(entry.minutes, 45);
  assert.equal(entry.description, 'code review');
});
