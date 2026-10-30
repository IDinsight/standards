import assert from 'node:assert/strict';
import test from 'node:test';

import { sampleRecords } from '../src/catalog.js';
import { search } from '../src/search.js';

test('finds records by title', () => {
  assert.deepEqual(search(sampleRecords, 'Soil').map((record) => record.id), ['pub-101', 'pub-104']);
});
