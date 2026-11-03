import assert from 'node:assert/strict';
import test from 'node:test';

import { QuerySyntaxError, parseQuery } from '../src/query.js';

test('plain words become lowercase terms', () => {
  assert.deepEqual(parseQuery('Budget  Meeting'), {
    terms: ['budget', 'meeting'],
    phrases: [],
    filters: { tag: [], title: [] },
  });
});

test('field filters are collected by field', () => {
  assert.deepEqual(parseQuery('tag:Work title:sync notes').filters, { tag: ['work'], title: ['sync'] });
});

test('quoted phrases are kept whole', () => {
  assert.deepEqual(parseQuery('"Weekly Sync" agenda').phrases, ['weekly sync']);
});

test('old tag= form is rejected', () => {
  assert.throws(() => parseQuery('tag=work'),
    (error) => error instanceof QuerySyntaxError && /tag:work/.test(error.message));
});

test('old tag= form is rejected after other words', () => {
  assert.throws(() => parseQuery('meeting tag=work'),
    (error) => error instanceof QuerySyntaxError && /tag:work/.test(error.message));
});
