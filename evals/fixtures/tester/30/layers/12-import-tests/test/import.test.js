import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { Directory, loadDirectory, saveDirectory } from '../src/directory.js';

async function tempFile(name, contents) {
  const folder = await mkdtemp(path.join(tmpdir(), 'contacts-'));
  const file = path.join(folder, name);
  if (contents !== undefined) await writeFile(file, contents);
  return file;
}

test('rejects a file that is not an array', async () => {
  const file = await tempFile('one.json', JSON.stringify({ id: 'c1', name: 'Ada' }));
  await assert.rejects(loadDirectory(file), /one\.json: expected a JSON array of contacts/);
});

test('reports the row of a missing id', async () => {
  const file = await tempFile('rows.json', JSON.stringify([{ id: 'c1', name: 'Ada' }, { name: 'Alan' }]));
  await assert.rejects(loadDirectory(file), /row 2 has no id/);
});

test('reports the row of a repeated id', async () => {
  const file = await tempFile('repeat.json', JSON.stringify([{ id: 'c1', name: 'Ada' }, { id: 'c1', name: 'Alan' }]));
  await assert.rejects(loadDirectory(file), /row 2 repeats id c1/);
});

test('stores emails trimmed and lowercased', async () => {
  const file = await tempFile('email.json', JSON.stringify([{ id: 'c1', name: 'Ada', email: '  Ada@Example.ORG ' }]));
  const directory = await loadDirectory(file);
  assert.equal(directory.get('c1').email, 'ada@example.org');
});

test('saveDirectory output loads back unchanged', async () => {
  const file = await tempFile('saved.json');
  const directory = new Directory()
    .add({ id: 'c2', name: 'Alan Turing', email: 'alan@example.org' })
    .add({ id: 'c1', name: 'Ada Lovelace', email: 'ada@example.org' });
  await saveDirectory(directory, file);
  const saved = JSON.parse(await readFile(file, 'utf8'));
  assert.deepEqual(saved.map((contact) => contact.id), ['c1', 'c2']);
  assert.deepEqual((await loadDirectory(file)).list(), directory.list());
});
