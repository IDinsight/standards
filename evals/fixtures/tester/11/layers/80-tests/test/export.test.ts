import assert from 'node:assert/strict';
import { test } from 'node:test';

import { csvCell } from '../src/export.ts';

test('plain values are written unquoted', () => {
  assert.equal(csvCell('Insurance renewal 2026'), 'Insurance renewal 2026');
  assert.equal(csvCell(42), '42');
});

test('values containing a comma are quoted', () => {
  assert.equal(csvCell('Lease agreement, Building B'), '"Lease agreement, Building B"');
});

test('double quotes inside a value are doubled and the value is quoted', () => {
  assert.equal(csvCell('Q2 "priority" accounts review'), '"Q2 ""priority"" accounts review"');
});

test('values containing a line break are quoted', () => {
  assert.equal(csvCell('first line\r\nsecond line'), '"first line\r\nsecond line"');
});
