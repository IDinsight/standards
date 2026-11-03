import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/cli.js';

const csv = 'date,project,hours\n2026-09-14,atlas,2.5\n2026-09-16,beacon,4\n2026-09-22,atlas,3\n';
const read = () => csv;

test('report prints the total for the week containing the date', () => {
  assert.deepEqual(run(['report', 'hours.csv', '2026-09-16'], read), { code: 0, output: 'Week of 2026-09-14: 6.5 h' });
});

test('report without a date prints usage', () => {
  assert.equal(run(['report', 'hours.csv'], read).code, 2);
});

test('--by-project lists each project under the total', () => {
  assert.deepEqual(run(['report', 'hours.csv', '2026-09-16', '--by-project'], read), {
    code: 0,
    output: 'Week of 2026-09-14: 6.5 h\n  beacon: 4 h\n  atlas: 2.5 h',
  });
});

test('unknown options print usage', () => {
  assert.equal(run(['report', 'hours.csv', '2026-09-16', '--csv'], read).code, 2);
});
