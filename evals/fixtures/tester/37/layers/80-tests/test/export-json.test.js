import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { run } from '../src/cli.js';
import { toJson } from '../src/export.js';

const SAMPLE = fileURLToPath(new URL('../data/sample.json', import.meta.url));
const EXPECTED = [
  { sku: 'A-100', name: 'Hex bolt, M6', quantity: 240, location: 'Aisle 3' },
  { sku: 'B-220', name: 'Washer "flat" 6mm', quantity: 1200, location: 'Aisle 3' },
  { sku: 'C-031', name: 'Cable tie', quantity: 0, location: '' },
];

function sink() {
  return { text: '', write(chunk) { this.text += chunk; } };
}

test('toJson emits one object per item with the export columns only', () => {
  const text = toJson([{ sku: 'X-1', name: 'Nut', quantity: 5, location: 'Bin 2', supplier: 'Acme' }]);
  const rows = JSON.parse(text);
  assert.deepEqual(rows, [{ sku: 'X-1', name: 'Nut', quantity: 5, location: 'Bin 2' }]);
  assert.deepEqual(Object.keys(rows[0]), ['sku', 'name', 'quantity', 'location']);
  assert.ok(text.endsWith('\n'));
});

test('export --format json writes the sample inventory as JSON', async () => {
  const stdout = sink();
  const stderr = sink();
  assert.equal(await run(['export', SAMPLE, '--format', 'json'], { stdout, stderr }), 0);
  assert.deepEqual(JSON.parse(stdout.text), EXPECTED);
  assert.equal(stderr.text, '');
});

test('--format=json is accepted', async () => {
  const stdout = sink();
  const stderr = sink();
  assert.equal(await run(['export', '--format=json', SAMPLE], { stdout, stderr }), 0);
  assert.deepEqual(JSON.parse(stdout.text), EXPECTED);
});

test('an unknown format is rejected with exit code 2 and nothing on stdout', async () => {
  const stdout = sink();
  const stderr = sink();
  // The input path does not exist: the format must be rejected before it is read.
  const code = await run(['export', 'missing-inventory.json', '--format', 'xml'], { stdout, stderr });
  assert.equal(code, 2);
  assert.equal(stdout.text, '');
  assert.match(stderr.text, /Unknown format "xml"/);
  assert.match(stderr.text, /csv/);
  assert.match(stderr.text, /json/);
});

test('export without --format still writes CSV', async () => {
  const stdout = sink();
  const stderr = sink();
  assert.equal(await run(['export', SAMPLE], { stdout, stderr }), 0);
  assert.equal(stdout.text.split('\n')[0], 'sku,name,quantity,location');
});
