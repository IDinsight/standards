import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadSaved, runSaved, saveSearch } from '../src/saved.js';

const notes = [
  { id: 1, title: 'Weekly sync', body: 'Budget review', tags: ['work'] },
  { id: 3, title: 'Sync notes', body: 'Budget: weekly numbers', tags: ['finance'] },
];

test('runs a saved query by name', () => {
  assert.deepEqual(runSaved({ finance: 'tag=finance' }, 'finance', notes).map((note) => note.id), [3]);
});

test('an unknown name is an error', () => {
  assert.throws(() => runSaved({}, 'missing', notes), /No saved search named "missing"/);
});

test('saveSearch stores the query text', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'notes-'));
  try {
    const file = path.join(dir, 'saved.json');
    saveSearch(file, 'weekly', 'tag=work standup');
    assert.deepEqual(loadSaved(file), { weekly: 'tag=work standup' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
