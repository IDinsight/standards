import assert from 'node:assert/strict';
import test from 'node:test';

import { main, parseArgs } from '../src/cli.js';

function capture() {
  let text = '';
  return { write: (chunk) => { text += chunk; }, get text() { return text; } };
}

test('parseArgs defaults', () => {
  assert.deepEqual(parseArgs(['hours.csv']), { file: 'hours.csv', by: 'project', from: null, to: null });
});

test('summarizes a file by day within a date range', async () => {
  const stdout = capture();
  const stderr = capture();
  const code = await main(['test/data/sample.csv', '--by', 'day', '--from', '2026-09-02', '--to', '2026-09-03'], { stdout, stderr });
  assert.equal(code, 0);
  assert.equal(stdout.text, '2026-09-02     3.00\n2026-09-03     2.50\nTOTAL          5.50\n');
});

test('reports a bad --by value with exit status 2', async () => {
  const stdout = capture();
  const stderr = capture();
  assert.equal(await main(['test/data/sample.csv', '--by', 'week'], { stdout, stderr }), 2);
  assert.match(stderr.text, /--by must be project or day/);
});
