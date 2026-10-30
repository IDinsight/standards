import assert from 'node:assert/strict';
import test from 'node:test';

import { formatNote, formatNotes } from '../src/format.js';

test('formatNote writes the title as a heading followed by the body', () => {
  assert.equal(formatNote({ id: 1, title: 'Plan', body: 'Draft outline' }), '# Plan\n\nDraft outline');
});

test('formatNote omits the body section when the body is empty', () => {
  assert.equal(formatNote({ id: 1, title: 'Plan', body: '' }), '# Plan');
});

test('formatNotes separates notes with a blank line', () => {
  const text = formatNotes([
    { id: 1, title: 'One', body: '' },
    { id: 2, title: 'Two', body: 'Second' },
  ]);
  assert.equal(text, '# One\n\n# Two\n\nSecond');
});
