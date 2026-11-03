import assert from 'node:assert/strict';
import test from 'node:test';

import { formatTable, parseCsv, summarize } from '../src/summarize.js';

test('totals hours per person in name order', () => {
  const rows = summarize(parseCsv('name,hours\nBen,2\nAna,1.5\nBen,0.5\n'));
  assert.deepEqual(rows, [{ name: 'Ana', hours: 1.5 }, { name: 'Ben', hours: 2.5 }]);
});

test('ignores extra columns, column order, spaces, and blank lines', () => {
  const rows = summarize(parseCsv('date, hours ,name\r\n\r\n2026-09-21, 3 , Ana\r\n'));
  assert.deepEqual(rows, [{ name: 'Ana', hours: 3 }]);
});

test('returns no entries for an empty file or a header-only file', () => {
  assert.deepEqual(parseCsv(''), []);
  assert.deepEqual(parseCsv('name,hours\n'), []);
});

test('rejects a header without name or hours', () => {
  assert.throws(() => parseCsv('who,hours\nAna,1\n'), /must include name and hours/);
});

test('rejects an empty name or a missing or non-numeric hours value', () => {
  assert.throws(() => parseCsv('name,hours\n,2\n'), /Line 2: name is empty/);
  assert.throws(() => parseCsv('name,hours\nAna,\n'), /Line 2: hours is not a number/);
  assert.throws(() => parseCsv('name,hours\n\nAna,lots\n'), /Line 3: hours is not a number/);
});

test('formats totals with two decimal places', () => {
  assert.equal(formatTable([{ name: 'Ana', hours: 13.5 }, { name: 'Ben', hours: 8 }]), 'Ana: 13.50\nBen: 8.00');
});
