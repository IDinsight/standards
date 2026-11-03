import assert from 'node:assert/strict';
import test from 'node:test';

import { slugify } from '../src/slug.js';

test('lowercases and joins words with hyphens', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('strips accents', () => {
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
});

test('collapses punctuation and trims hyphens', () => {
  assert.equal(slugify(' -- Q3: Results & Plans! --'), 'q3-results-plans');
});
