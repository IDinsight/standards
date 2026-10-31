import assert from 'node:assert/strict';
import test from 'node:test';

import { filterLines, parseLine } from '../src/filter.js';

const lines = [
  '2026-03-01T10:00:00Z [info] Server started',
  '2026-03-01T10:00:01Z [debug] Loaded routes',
  '2026-03-01T10:00:02Z [error] Upload failed',
  'not a log line',
];

test('parseLine reads time, level, and message', () => {
  assert.deepEqual(parseLine(lines[0]), { time: '2026-03-01T10:00:00Z', level: 'info', message: 'Server started' });
});

test('parseLine returns null for other text', () => {
  assert.equal(parseLine(lines[3]), null);
});

test('default level keeps info and above', () => {
  assert.deepEqual(filterLines(lines), [lines[0], lines[2]]);
});

test('grep ignores case', () => {
  assert.deepEqual(filterLines(lines, { grep: 'UPLOAD' }), [lines[2]]);
});

test('unknown level is rejected', () => {
  assert.throws(() => filterLines(lines, { level: 'trace' }), /unknown level/);
});
