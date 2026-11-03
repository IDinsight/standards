import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/report.js', import.meta.url));
const data = fileURLToPath(new URL('./data/entries.csv', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });

test('prints the full report without --since', () => {
  const result = run(data);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'alpha\t2.25h\nbeta\t1.50h\n');
});

test('--since limits the report to entries on or after the date', () => {
  const result = run('--since', '2026-09-08', data);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'alpha\t0.75h\nbeta\t1.00h\n');
});

test('rejects an invalid --since date with status 2 and no report', () => {
  for (const value of ['2026-13-01', '09/08/2026']) {
    const result = run('--since', value, data);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /invalid --since date/);
  }
});

test('rejects --since without a value', () => {
  const result = run(data, '--since');
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
});
