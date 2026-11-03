import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/cli.js';

function capture() {
  const sink = { text: '' };
  sink.write = (chunk) => { sink.text += chunk; };
  return sink;
}

test('--month limits totals to entries dated in that month', () => {
  const out = capture();
  assert.equal(run(['summary', 'data/sample.csv', '--month', '2026-09'], out, capture()), 0);
  assert.equal(out.text, 'groceries\t54.25\nrent\t1200.00\ntransport\t22.25\n');
});

test('a month with no entries prints no totals', () => {
  const out = capture();
  assert.equal(run(['summary', 'data/sample.csv', '--month', '2026-07'], out, capture()), 0);
  assert.equal(out.text, '\n');
});

for (const value of ['2026-9', 'September', '2026/09', '']) {
  test(`--month ${JSON.stringify(value)} is rejected with exit 2`, () => {
    const out = capture();
    const err = capture();
    assert.equal(run(['summary', 'data/sample.csv', '--month', value], out, err), 2);
    assert.match(err.text, /expected YYYY-MM/);
    assert.equal(out.text, '');
  });
}
