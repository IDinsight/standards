import assert from 'node:assert/strict';
import test from 'node:test';

import { parseEntries, parseLine } from '../src/parse.js';

test('parses a plain entry', () => {
  const entry = parseLine('2026-09-20 45m code review');
  assert.equal(entry.date, '2026-09-20');
  assert.equal(entry.minutes, 45);
  assert.equal(entry.description, 'code review');
});

test('separates tags from the description', () => {
  assert.deepEqual(parseLine('2026-09-21 1h30m sprint planning #ops #meetings'), {
    date: '2026-09-21',
    minutes: 90,
    description: 'sprint planning',
    tags: ['ops', 'meetings'],
  });
});

test('reports a malformed line and keeps going', () => {
  const text = ['2026-09-21 2h deploy #ops', '2026-09-21 1x standup', '', '2026-09-22 30m retro'].join('\n');
  const { entries, errors } = parseEntries(text);
  assert.deepEqual(errors, [{ line: 2, message: 'invalid duration "1x"' }]);
  assert.deepEqual(entries.map((entry) => entry.description), ['deploy', 'retro']);
});

test('reports an invalid date', () => {
  const { entries, errors } = parseEntries('20-09-2026 1h review');
  assert.equal(entries.length, 0);
  assert.deepEqual(errors, [{ line: 1, message: 'invalid date "20-09-2026"' }]);
});
