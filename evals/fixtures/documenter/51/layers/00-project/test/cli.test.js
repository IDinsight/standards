import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { run } from '../src/cli.js';

const DAY = 24 * 60 * 60 * 1000;

function sink() {
  const chunks = [];
  return { write: (text) => chunks.push(text), text: () => chunks.join('') };
}

test('removes logs older than --days and reports them', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'logprune-'));
  try {
    const now = Date.UTC(2026, 8, 1);
    await writeFile(path.join(dir, 'app.log.1'), 'old');
    await writeFile(path.join(dir, 'app.log'), 'new');
    await utimes(path.join(dir, 'app.log.1'), new Date(now - 20 * DAY), new Date(now - 20 * DAY));
    await utimes(path.join(dir, 'app.log'), new Date(now - DAY), new Date(now - DAY));
    const out = sink();
    assert.equal(await run([dir, '--days', '14'], { out, now }), 0);
    assert.equal(out.text(), 'removed app.log.1\n');
    assert.deepEqual(await readdir(dir), ['app.log']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('rejects a non-numeric --days value', async () => {
  const out = sink();
  assert.equal(await run(['/tmp', '--days', 'two'], { out }), 2);
  assert.match(out.text(), /invalid --days/);
});
