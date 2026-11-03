import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatCell, parseCsv } from '../src/csv.js';

test('formatCell leaves plain values unquoted', () => {
  assert.equal(formatCell('Office move inventory'), 'Office move inventory');
  assert.equal(formatCell(7), '7');
});

test('formatCell quotes commas, double quotes, and line breaks', () => {
  assert.equal(formatCell('Lease, Building B'), '"Lease, Building B"');
  assert.equal(formatCell('Q2 "priority" review'), '"Q2 ""priority"" review"');
  assert.equal(formatCell('line one\nline two'), '"line one\nline two"');
});

test('parseCsv reads quoted fields with embedded quotes, commas, and line breaks', () => {
  const text = 'id,title,owner\r\n1,"Lease, Building B",dana\r\n2,"Q2 ""priority""\nreview",li\r\n';
  assert.deepEqual(parseCsv(text), [
    { id: '1', title: 'Lease, Building B', owner: 'dana' },
    { id: '2', title: 'Q2 "priority"\nreview', owner: 'li' },
  ]);
});

test('parseCsv accepts LF line endings and skips blank lines', () => {
  assert.deepEqual(parseCsv('id,title,owner\n4,Insurance renewal,marco\n\n'), [
    { id: '4', title: 'Insurance renewal', owner: 'marco' },
  ]);
});
