import assert from 'node:assert/strict';
import test from 'node:test';

import { InputError, parseEntries } from '../src/parse.js';

test('reads columns in any order and ignores extra columns', () => {
  const entries = parseEntries('Project,Hours,Date,Note\nalpha,1.5,2026-09-01,kickoff\n');
  assert.deepEqual(entries, [{ date: '2026-09-01', project: 'alpha', hours: 1.5 }]);
});

test('rejects a missing column', () => {
  assert.throws(() => parseEntries('date,hours\n2026-09-01,2\n'), InputError);
});

test('rejects dates not in YYYY-MM-DD form', () => {
  assert.throws(() => parseEntries('date,project,hours\n01/09/2026,alpha,2\n'), /line 2: date must be YYYY-MM-DD/);
});
