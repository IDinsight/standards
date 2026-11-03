import assert from 'node:assert/strict';
import test from 'node:test';

import { noteToMarkdown, toMarkdown } from '../src/export.js';

test('renders a note as a heading and body', () => {
  assert.equal(noteToMarkdown({ title: 'Groceries', body: '  milk, eggs \n' }), '## Groceries\n\nmilk, eggs\n');
});

test('separates notes with a blank line', () => {
  const output = toMarkdown([{ title: 'A', body: 'one' }, { title: 'B', body: 'two' }]);
  assert.equal(output, '## A\n\none\n\n## B\n\ntwo\n');
});

test('an empty list exports nothing', () => {
  assert.equal(toMarkdown([]), '');
});
