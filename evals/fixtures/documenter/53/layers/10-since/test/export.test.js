import assert from 'node:assert/strict';
import test from 'node:test';

import { exportEntries, parseLine } from '../src/export.js';

const SAMPLE = [
  '2026-09-01T10:00:00Z DEBUG cache warm',
  '2026-09-01T10:00:05Z INFO server started',
  'not a log line',
  '2026-09-01T10:01:00Z ERROR disk full',
].join('\n');

test('parseLine reads time, level, and message', () => {
  assert.deepEqual(parseLine('2026-09-01T10:00:05Z INFO server started'),
    { time: '2026-09-01T10:00:05Z', level: 'info', message: 'server started' });
  assert.equal(parseLine('not a log line'), null);
});

test('exportEntries keeps info and above by default', () => {
  const lines = exportEntries(SAMPLE).split('\n').map((line) => JSON.parse(line));
  assert.deepEqual(lines.map((entry) => entry.level), ['info', 'error']);
});

test('exportEntries rejects an unknown level', () => {
  assert.throws(() => exportEntries(SAMPLE, { minLevel: 'loud' }), /unknown level/);
});

test('exportEntries drops entries before since', () => {
  const lines = exportEntries(SAMPLE, { since: '2026-09-01T10:00:30Z' }).split('\n').map((line) => JSON.parse(line));
  assert.deepEqual(lines.map((entry) => entry.message), ['disk full']);
});

test('exportEntries rejects an unparseable since', () => {
  assert.throws(() => exportEntries(SAMPLE, { since: 'yesterday' }), /invalid since/);
});
