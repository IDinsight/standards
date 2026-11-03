import assert from 'node:assert/strict';
import test from 'node:test';

import { slugify, uniqueSlug } from '../src/slug.js';

test('slugify lowercases and joins words with hyphens', () => {
  assert.equal(slugify('  Hello, World!  '), 'hello-world');
  assert.equal(slugify('Café au lait'), 'cafe-au-lait');
});

test('slugify keeps slugs within 60 characters', () => {
  const slug = slugify('word '.repeat(30));
  assert.ok(slug.length <= 60);
  assert.ok(!slug.endsWith('-'));
});

test('uniqueSlug appends the next free number', () => {
  assert.equal(uniqueSlug('Hello World', []), 'hello-world');
  assert.equal(uniqueSlug('Hello World', ['hello-world', 'hello-world-2']), 'hello-world-3');
});
