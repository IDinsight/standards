import assert from 'node:assert/strict';
import test from 'node:test';

import { slugify } from '../src/slug.js';

test('lowercases and joins words with hyphens', () => {
  assert.equal(slugify('Quarterly Report 2026'), 'quarterly-report-2026');
});

test('removes accents', () => {
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
});

test('drops leading and trailing separators', () => {
  assert.equal(slugify('  --Hello, World!-- '), 'hello-world');
});

test('maxLength cuts at the last word boundary', () => {
  assert.equal(slugify('Hello World Again', { maxLength: 11 }), 'hello-world');
  assert.equal(slugify('Hello World Again', { maxLength: 8 }), 'hello');
});

test('maxLength cuts a single long word', () => {
  assert.equal(slugify('Supercalifragilistic', { maxLength: 5 }), 'super');
});

test('maxLength leaves short slugs unchanged', () => {
  assert.equal(slugify('Short title', { maxLength: 40 }), 'short-title');
});
