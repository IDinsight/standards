import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/timesheet.js', import.meta.url));

function runWith(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
}

function runLog(contents) {
  const dir = mkdtempSync(path.join(tmpdir(), 'timesheet-'));
  const file = path.join(dir, 'log.txt');
  writeFileSync(file, contents);
  return runWith([file]);
}

test('prints sorted totals and exits 0', () => {
  const result = runLog('2026-09-01 website 1h30m\n2026-09-01 admin 45m\n# lunch\n\n2026-09-02 website 2h\n');
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'admin\t0:45\nwebsite\t3:30\n');
  assert.equal(result.stderr, '');
});

test('prints nothing for an empty log', () => {
  const result = runLog('');
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
});

test('a malformed line prints no report and exits 1', () => {
  const result = runLog('2026-09-01 website 1h30m\n2026-09-02 admin 1h75m\n');
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /line 2/);
});

test('a missing argument exits 2 with usage', () => {
  const result = runWith([]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /usage: timesheet/);
});

test('an unreadable file exits 2', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'timesheet-'));
  const result = runWith([path.join(dir, 'absent.txt')]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /cannot read/);
});
