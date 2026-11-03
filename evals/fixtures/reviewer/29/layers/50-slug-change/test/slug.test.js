import assert from 'node:assert/strict';
import test from 'node:test';

import { slugify } from '../src/slug.js';

test('lowercases and joins words with hyphens', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('strips punctuation', () => {
  assert.equal(slugify('Ready, set: go!'), 'ready-set-go');
});

test('removes accents', () => {
  assert.equal(slugify('Crème brûlée'), 'creme-brulee');
});

test('collapses repeated hyphens', () => {
  assert.equal(slugify('Q3 - Results'), 'q3-results');
});

test('trims leading and trailing hyphens', () => {
  assert.equal(slugify('--Draft--'), 'draft');
});
