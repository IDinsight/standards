import assert from 'node:assert/strict';
import test from 'node:test';

import { formatMinutes } from '../src/format.js';
import { summarize } from '../src/summary.js';

test('totals minutes across entries', () => {
  const result = summarize([
    { date: '2026-09-21', minutes: 480 },
    { date: '2026-09-22', minutes: 450 },
  ]);
  assert.equal(result.totalMinutes, 930);
});

test('groups minutes by day in date order', () => {
  const result = summarize([
    { date: '2026-09-22', minutes: 120 },
    { date: '2026-09-21', minutes: 240 },
    { date: '2026-09-22', minutes: 60 },
  ]);
  assert.deepEqual(result.byDay, { '2026-09-21': 240, '2026-09-22': 180 });
});

test('rejects negative minutes', () => {
  assert.throws(() => summarize([{ date: '2026-09-21', minutes: -5 }]), RangeError);
});

test('formats minutes as hours and minutes', () => {
  assert.equal(formatMinutes(450), '7h 30m');
  assert.equal(formatMinutes(480), '8h');
});
