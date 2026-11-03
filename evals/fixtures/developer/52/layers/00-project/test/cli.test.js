import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { run } from '../src/cli.js';

async function workspace(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'tasks-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const lines = [];
  return { file: path.join(dir, 'tasks.json'), lines, out: (line) => lines.push(line) };
}

test('add then list prints the new task', async (t) => {
  const { file, lines, out } = await workspace(t);
  assert.equal(await run(['add', 'Buy', 'milk'], { file, out }), 0);
  assert.equal(await run(['list'], { file, out }), 0);
  assert.deepEqual(lines, ['added 1', '1. [ ] Buy milk']);
});

test('done hides a task from list until --all is given', async (t) => {
  const { file, lines, out } = await workspace(t);
  await run(['add', 'Book', 'dentist'], { file, out });
  await run(['add', 'Renew', 'passport'], { file, out });
  await run(['done', '1'], { file, out });
  lines.length = 0;
  await run(['list'], { file, out });
  assert.deepEqual(lines, ['2. [ ] Renew passport']);
  lines.length = 0;
  await run(['list', '--all'], { file, out });
  assert.deepEqual(lines, ['1. [x] Book dentist', '2. [ ] Renew passport']);
});

test('an unknown command prints usage and fails', async (t) => {
  const { file, lines, out } = await workspace(t);
  assert.equal(await run(['remove', '1'], { file, out }), 1);
  assert.match(lines[0], /^usage:/);
});
