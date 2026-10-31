import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadNotes } from '../src/store.js';

async function fileWith(contents) {
  const dir = await mkdtemp(path.join(tmpdir(), 'notes-'));
  const file = path.join(dir, 'notes.json');
  await writeFile(file, contents);
  return file;
}

test('loads title and body from each note', async () => {
  const file = await fileWith(JSON.stringify([{ title: 'A', body: 'one', tags: ['x'] }]));
  assert.deepEqual(await loadNotes(file), [{ title: 'A', body: 'one' }]);
});

test('rejects a note without a body', async () => {
  const file = await fileWith(JSON.stringify([{ title: 'A' }]));
  await assert.rejects(loadNotes(file), /note 0 needs a string title and body/);
});
