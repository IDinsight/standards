import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/export.js';

test('toCsv quotes commas, quotes, and newlines', () => {
  const csv = toCsv([
    { sku: 'X-1', name: 'a,b', quantity: 1, location: 'line\nbreak' },
    { sku: 'X-2', name: 'say "hi"', quantity: 2, location: '' },
  ]);
  assert.equal(csv, [
    'sku,name,quantity,location',
    'X-1,"a,b",1,"line\nbreak"',
    'X-2,"say ""hi""",2,',
    '',
  ].join('\n'));
});

test('toCsv writes only the header for an empty inventory', () => {
  assert.equal(toCsv([]), 'sku,name,quantity,location\n');
});
