import assert from 'node:assert/strict';
import { mkdtemp, readdir, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { formatSummary, runCleanup } from '../src/cleanup.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 8, 20, 12, 0, 0);

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
