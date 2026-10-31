import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readdir, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { formatSummary, isExpired, runCleanup } from '../src/cleanup.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = Date.UTC(2026, 8, 20, 12, 0, 0);
const CLI = fileURLToPath(new URL('../bin/cleanup.js', import.meta.url));

async function archiveWith(ages, now = NOW) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'archive-'));
  for (const [name, ageMs] of Object.entries(ages)) {
    const file = path.join(dir, name);
    await writeFile(file, 'id,total\n1,10\n');
    const time = new Date(now - ageMs);
    await utimes(file, time, time);
  }
  return dir;
}

function runCli(args, env) {
  return spawnSync(process.execPath, [CLI, ...args], { env: { ...process.env, ...env }, encoding: 'utf8' });
}

test('removes archives older than 30 days', async () => {
  const dir = await archiveWith({ 'export-old.csv': 40 * DAY, 'export-new.csv': 5 * DAY });
  const summary = await runCleanup({ archiveDir: dir, now: NOW });
  assert.deepEqual(summary.removed, ['export-old.csv']);
  assert.equal(summary.kept, 1);
  assert.deepEqual(await readdir(dir), ['export-new.csv']);
});

test('formatSummary reports a real run', () => {
  assert.equal(
    formatSummary({ scanned: 2, removed: ['export-old.csv'], kept: 1 }),
    'archive cleanup: scanned 2, removed 1, kept 1',
  );
});

test('removes files older than a configured window and keeps newer ones', async () => {
  const dir = await archiveWith({
    'export-a.csv': 7 * DAY + HOUR,
    'export-b.csv': 7 * DAY - HOUR,
    'export-c.csv': DAY,
  });
  const summary = await runCleanup({ archiveDir: dir, retentionDays: 7, now: NOW });
  assert.deepEqual(summary.removed, ['export-a.csv']);
  assert.equal(summary.kept, 2);
  assert.deepEqual((await readdir(dir)).sort(), ['export-b.csv', 'export-c.csv']);
});

test('treats a file exactly at the boundary as kept', () => {
  assert.equal(isExpired(NOW - 7 * DAY, NOW, 7), false);
  assert.equal(isExpired(NOW - 7 * DAY - 1, NOW, 7), true);
});

test('dry run reports expired files without deleting them', async () => {
  const dir = await archiveWith({ 'export-a.csv': 10 * DAY, 'export-b.csv': 2 * DAY });
  const summary = await runCleanup({ archiveDir: dir, retentionDays: 7, now: NOW, dryRun: true });
  assert.equal(summary.dryRun, true);
  assert.deepEqual(summary.removed, ['export-a.csv']);
  assert.equal(summary.kept, 1);
  assert.deepEqual((await readdir(dir)).sort(), ['export-a.csv', 'export-b.csv']);
});

test('formatSummary reports a dry run', () => {
  assert.equal(
    formatSummary({ scanned: 3, removed: ['export-a.csv', 'export-b.csv'], kept: 1, dryRun: true }),
    'archive cleanup: scanned 3, would remove 2, kept 1',
  );
});

test('ignores subdirectories', async () => {
  const dir = await archiveWith({ 'export-a.csv': 40 * DAY });
  const nested = path.join(dir, 'nested');
  await mkdir(nested);
  const old = new Date(NOW - 40 * DAY);
  await utimes(nested, old, old);
  const summary = await runCleanup({ archiveDir: dir, retentionDays: 7, now: NOW });
  assert.equal(summary.scanned, 1);
  assert.deepEqual(summary.removed, ['export-a.csv']);
  assert.deepEqual(await readdir(dir), ['nested']);
});

test('CLI dry run prints the summary and leaves files in place', async () => {
  const dir = await archiveWith({ 'export-old.csv': 10 * DAY, 'export-new.csv': DAY }, Date.now());
  const result = runCli(['--dry-run'], { ARCHIVE_DIR: dir, ARCHIVE_RETENTION_DAYS: '7' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /archive cleanup: scanned 2, would remove 1, kept 1/);
  assert.match(result.stdout, /^  export-old\.csv$/m);
  assert.deepEqual((await readdir(dir)).sort(), ['export-new.csv', 'export-old.csv']);
});

test('CLI stops before removing anything when the window is invalid', async () => {
  const dir = await archiveWith({ 'export-old.csv': 400 * DAY }, Date.now());
  const result = runCli([], { ARCHIVE_DIR: dir, ARCHIVE_RETENTION_DAYS: '0' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ARCHIVE_RETENTION_DAYS/);
  assert.deepEqual(await readdir(dir), ['export-old.csv']);
});
