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
