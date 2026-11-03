import assert from 'node:assert/strict';
import test from 'node:test';

import { slugify } from '../src/slug.js';

test('lowercases and joins words with hyphens', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('strips accents', () => {
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
});

test('collapses punctuation and repeated separators', () => {
  assert.equal(slugify('  Rock & Roll -- Live!  '), 'rock-roll-live');
});

test('returns an empty string for text without letters or digits', () => {
  assert.equal(slugify('!!!'), '');
});
