import assert from 'node:assert/strict';
import test from 'node:test';

import { toCsv } from '../src/csv.js';

test('writes a header row', () => {
  assert.equal(toCsv([]), 'date,site,visitor,notes');
});

test('writes one line per visit in column order', () => {
  const csv = toCsv([{ date: '2026-09-03', site: 'Kisumu clinic', visitor: 'A. Otieno', notes: 'Routine' }]);
  assert.equal(csv.split('\n')[1], '2026-09-03,Kisumu clinic,A. Otieno,Routine');
});

test('quotes fields that contain commas or quotes', () => {
  const csv = toCsv([{ date: '2026-09-08', site: 'Bondo clinic', visitor: 'M. Achieng', notes: 'Follow-up, "urgent"' }]);
  assert.equal(csv.split('\n')[1], '2026-09-08,Bondo clinic,M. Achieng,"Follow-up, ""urgent"""');
});
