import assert from 'node:assert/strict';
import test from 'node:test';

import { parseEntries } from '../src/entries.js';

test('parseEntries reads date, project, and hours', () => {
  const text = 'date,project,hours\n2026-09-14,atlas,2.5\n\n2026-09-15, beacon ,4\n';
  assert.deepEqual(parseEntries(text), [
    { date: '2026-09-14', project: 'atlas', hours: 2.5 },
    { date: '2026-09-15', project: 'beacon', hours: 4 },
  ]);
});

test('parseEntries rejects malformed rows', () => {
  assert.throws(() => parseEntries('date,project,hours\n14/09/2026,atlas,2\n'), /line 2/);
  assert.throws(() => parseEntries('day,project,hours\n'), /unexpected header/);
});
