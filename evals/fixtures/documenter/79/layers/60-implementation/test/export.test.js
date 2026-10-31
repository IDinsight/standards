import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/cli.js';
import { exportItems, parseSince } from '../src/export.js';

const items = [
  { sku: 'A1', name: 'Bolt', quantity: 40, updatedAt: '2026-08-30T08:00:00.000Z' },
  { sku: 'A2', name: 'Nut, hex', quantity: 15, updatedAt: '2026-09-01T09:30:00.000Z' },
];

test('exports every item with a header row', () => {
  assert.equal(
    exportItems(items),
    'sku,name,quantity,updatedAt\nA1,Bolt,40,2026-08-30T08:00:00.000Z\nA2,"Nut, hex",15,2026-09-01T09:30:00.000Z\n',
  );
});

test('--since keeps items updated on or after the date', () => {
  const lateEvening = new Date(2026, 7, 31, 23, 30).toISOString();
  const rows = [...items, { sku: 'A3', name: 'Washer', quantity: 90, updatedAt: lateEvening }];
  const csv = exportItems(rows, { since: parseSince('2026-08-31') });
  assert.deepEqual(csv.trim().split('\n').slice(1).map((line) => line.split(',')[0]), ['A2', 'A3']);
});

test('--since rejects a value that is not YYYY-MM-DD', () => {
  let output = '';
  let errors = '';
  const code = run(['export', '--since', '31/08/2026'], {
    stdout: { write: (text) => { output += text; } },
    stderr: { write: (text) => { errors += text; } },
  });
  assert.equal(code, 2);
  assert.equal(output, '');
  assert.match(errors, /invalid --since date/);
});
