import assert from 'node:assert/strict';
import test from 'node:test';

import { exportAttendance } from '../src/export.js';

const records = [
  { date: '2026-09-01', site: 'Hillside', participant: 'Asha Rao', present: true, notes: '' },
  { date: '2026-09-02', site: 'Riverbend', participant: 'Tomas Ortiz', present: false, notes: 'Called in, "travel"' },
];

test('header row followed by one row per record', () => {
  const lines = exportAttendance(records).split('\r\n');
  assert.equal(lines[0], 'date,site,participant,present,notes');
  assert.equal(lines.length, 4); // header, two rows, empty string after the final CRLF
  assert.equal(lines[1], '2026-09-01,Hillside,Asha Rao,yes,');
});

test('fields are quoted with the shared CSV rules', () => {
  const lines = exportAttendance(records).split('\r\n');
  assert.equal(lines[2], '2026-09-02,Riverbend,Tomas Ortiz,no,"Called in, ""travel"""');
});
