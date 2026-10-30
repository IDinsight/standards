import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/orders.js', import.meta.url));
const data = fileURLToPath(new URL('./data/orders.csv', import.meta.url));

test('summary prints the order count and total', () => {
  const output = execFileSync(process.execPath, [cli, 'summary', data], { encoding: 'utf8' });
  assert.equal(output, 'Orders: 5\nTotal: 511.50\n');
});

test('an unknown command prints usage and exits with status 2', () => {
  const result = spawnSync(process.execPath, [cli, 'report', data], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /^Usage: orders/);
});
