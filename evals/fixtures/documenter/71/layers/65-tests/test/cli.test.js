import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/cli.js';

const entries = [
  { date: '2026-09-14', project: 'billing', hours: 3 },
  { date: '2026-09-15', project: 'atlas', hours: 2 },
];

function capture(argv) {
  let out = '';
  const code = run(argv, entries, (text) => { out += text; });
  return { code, out };
}

test('summary prints one tab-separated line per project', () => {
  assert.deepEqual(capture(['summary']), { code: 0, out: 'atlas\t2\nbilling\t3\n' });
});

test('unknown command prints usage', () => {
  const { code, out } = capture(['report']);
  assert.equal(code, 1);
  assert.match(out, /^usage:/);
});

test('summary --since limits totals to entries on or after the date', () => {
  assert.deepEqual(capture(['summary', '--since', '2026-09-15']), { code: 0, out: 'atlas\t2\n' });
});

test('summary --since with a malformed date exits 2 without totals', () => {
  assert.deepEqual(capture(['summary', '--since', '2026-9-15']), {
    code: 2,
    out: 'invalid --since date: 2026-9-15\n',
  });
});

test('summary --since without a value exits 2', () => {
  assert.deepEqual(capture(['summary', '--since']), { code: 2, out: 'invalid --since date: \n' });
});
