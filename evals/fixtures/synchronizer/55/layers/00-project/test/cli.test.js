import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/cli.js';

function capture() {
  const sink = { text: '' };
  sink.write = (chunk) => { sink.text += chunk; };
  return sink;
}

test('summary prints category totals for the sample ledger', () => {
  const out = capture();
  assert.equal(run(['summary', 'data/sample.csv'], out, capture()), 0);
  assert.equal(out.text, 'groceries\t96.75\nrent\t2400.00\ntransport\t40.75\n');
});

test('a missing file argument prints usage', () => {
  const err = capture();
  assert.equal(run(['summary'], capture(), err), 2);
  assert.match(err.text, /^Usage: ledger summary/);
});
