import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeTags } from '../src/tags.js';

test('trims and lowercases tag names', () => {
  assert.deepEqual(normalizeTags(['  Home', 'WORK  ']), ['home', 'work']);
});

test('drops tags that repeat after normalization', () => {
  assert.deepEqual(normalizeTags(['Home', 'home', ' HOME ', 'work']), ['home', 'work']);
});

test('drops empty tags', () => {
  assert.deepEqual(normalizeTags(['', '   ', 'ideas']), ['ideas']);
});
