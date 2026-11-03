import assert from 'node:assert/strict';
import test from 'node:test';

import { parseRows } from '../src/importer.js';

test('parses rows keyed by header', () => {
  assert.deepEqual(parseRows('region,amount\nnorth,10\nsouth,5'), [
    { region: 'north', amount: '10' },
    { region: 'south', amount: '5' },
  ]);
});
