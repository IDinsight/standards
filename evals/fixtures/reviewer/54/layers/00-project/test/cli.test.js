import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const run = (...args) => spawnSync(process.execPath, ['bin/summarize.js', ...args], { encoding: 'utf8' });

test('prints a text summary', () => {
  const result = run('examples/sales.csv', '--column', 'amount');
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'count: 3\nskipped: 1\nsum: 300\nmin: 80\nmax: 120.5\nmean: 100\n');
});

test('prints a JSON summary', () => {
  const result = run('examples/sales.csv', '--column', 'units', '--format', 'json');
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '{"count":4,"skipped":0,"sum":10,"min":1,"max":4,"mean":2.5}\n');
});

test('exits 2 for an unknown column', () => {
  const result = run('examples/sales.csv', '--column', 'price');
  assert.equal(result.status, 2);
  assert.equal(result.stderr, 'Column not found: price\n');
});

test('exits 1 with usage when --column is missing', () => {
  const result = run('examples/sales.csv');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /^Usage: summarize/);
});
