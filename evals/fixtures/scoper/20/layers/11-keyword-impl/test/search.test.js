import assert from 'node:assert/strict';
import test from 'node:test';

import { sampleRecords } from '../src/catalog.js';
import { SearchError, search } from '../src/search.js';

const ids = (records) => records.map((record) => record.id);

test('matches titles and summaries ignoring case', () => {
  assert.deepEqual(ids(search(sampleRecords, 'SOIL')), ['pub-101', 'pub-104', 'pub-102']);
});

test('trims surrounding whitespace and lists a title match once', () => {
  assert.deepEqual(ids(search(sampleRecords, '  rainfall ')), ['pub-103']);
});

test('returns an empty list when nothing matches', () => {
  assert.deepEqual(search(sampleRecords, 'glacier'), []);
});

test('rejects an empty or whitespace-only query', () => {
  assert.throws(() => search(sampleRecords, ''), SearchError);
  assert.throws(() => search(sampleRecords, '   '), SearchError);
});
