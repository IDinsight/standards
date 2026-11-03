import assert from 'node:assert/strict';
import test from 'node:test';

import { createReadingList } from '../src/readingList.js';

test('add trims the title and author and keeps tags as given', () => {
  const list = createReadingList();
  list.add({ title: '  Middlemarch ', author: ' George Eliot', tags: ['Classics', 'Long'] });
  assert.deepEqual(list.list(), [
    { title: 'Middlemarch', author: 'George Eliot', tags: ['Classics', 'Long'] },
  ]);
});

test('add rejects a missing title', () => {
  const list = createReadingList();
  assert.throws(() => list.add({ author: 'Anon' }), TypeError);
  assert.throws(() => list.add({ title: '   ' }), TypeError);
});

test('list returns copies that callers cannot use to change the list', () => {
  const list = createReadingList();
  list.add({ title: 'Beloved', tags: ['fiction'] });
  list.list()[0].tags.push('changed');
  assert.deepEqual(list.list()[0].tags, ['fiction']);
});
