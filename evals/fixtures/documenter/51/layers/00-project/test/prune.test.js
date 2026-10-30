import assert from 'node:assert/strict';
import test from 'node:test';

import { selectExpired } from '../src/prune.js';

const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 8, 1);

test('selects only current and rotated log files past the cutoff', () => {
  const entries = [
    { name: 'app.log', mtimeMs: now - 2 * DAY },
    { name: 'app.log.3', mtimeMs: now - 30 * DAY },
    { name: 'app.log.2', mtimeMs: now - 15 * DAY },
    { name: 'notes.txt', mtimeMs: now - 90 * DAY },
  ];
  assert.deepEqual(selectExpired(entries, { now, maxAgeDays: 14 }), ['app.log.2', 'app.log.3']);
});

test('keeps a file exactly at the cutoff', () => {
  const entries = [{ name: 'a.log', mtimeMs: now - 14 * DAY }];
  assert.deepEqual(selectExpired(entries, { now, maxAgeDays: 14 }), []);
});
