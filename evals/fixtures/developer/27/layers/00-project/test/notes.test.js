import assert from 'node:assert/strict';
import test from 'node:test';

import { addNote, latestNote, MAX_NOTE_LENGTH } from '../src/notes.js';

test('addNote trims and appends a note', () => {
  const notes = addNote([], { author: 'dana', text: '  called customer  ', at: '2026-09-20T10:00:00Z' });
  assert.deepEqual(notes, [{ author: 'dana', text: 'called customer', at: '2026-09-20T10:00:00Z' }]);
  assert.equal(latestNote(notes).text, 'called customer');
});

test('addNote rejects notes over the length limit', () => {
  assert.throws(() => addNote([], { author: 'dana', text: 'x'.repeat(MAX_NOTE_LENGTH + 1), at: 't' }), RangeError);
});
