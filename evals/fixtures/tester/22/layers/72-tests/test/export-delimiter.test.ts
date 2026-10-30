import assert from 'node:assert/strict';
import { test } from 'node:test';

import { csvCell, toCsv } from '../src/export.ts';
import { semicolonCsv, semicolonRecords } from './fixtures/semicolon.ts';

test('semicolon delimiter separates the header and every row', () => {
  assert.equal(toCsv(semicolonRecords, { delimiter: ';' }), semicolonCsv);
});

test('a value containing a semicolon is quoted when semicolons separate fields', () => {
  assert.equal(csvCell('Rent; utilities', ';'), '"Rent; utilities"');
});
