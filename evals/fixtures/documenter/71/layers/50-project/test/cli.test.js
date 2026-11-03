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
