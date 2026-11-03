import assert from 'node:assert/strict';
import test from 'node:test';

import { TagStore } from '../src/store.js';
import { normalizeTag, parseTags } from '../src/tags.js';

test('normalizeTag trims and lowercases', () => {
  assert.equal(normalizeTag('  Work '), 'work');
});

test('parseTags splits on commas and drops empty entries', () => {
  assert.deepEqual(parseTags('Work, ,Home,'), ['work', 'home']);
});

test('TagStore keeps one copy of each normalized tag', () => {
  const store = new TagStore();
  store.add('n1', 'Work, home');
  assert.deepEqual(store.add('n1', 'WORK'), ['home', 'work']);
  assert.deepEqual(store.itemsTagged(' Home'), ['n1']);
});
