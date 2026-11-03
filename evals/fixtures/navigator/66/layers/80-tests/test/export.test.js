import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { run } from '../src/cli.js';
import { toCsv } from '../src/export.js';

const ITEMS = fileURLToPath(new URL('./data/items.json', import.meta.url));

function capture() {
  return { text: '', write(chunk) { this.text += chunk; } };
}

test('writes a header row and one line per item', () => {
  assert.equal(toCsv([{ sku: 'SKU-1', name: 'Bolt', quantity: 4 }]), 'sku,name,quantity\r\nSKU-1,Bolt,4\r\n');
});

test('quotes fields containing commas', () => {
  assert.equal(toCsv([{ sku: 'SKU-2', name: 'Washer, wide', quantity: 1 }]).split('\r\n')[1], 'SKU-2,"Washer, wide",1');
});

test('doubles embedded double quotes', () => {
  assert.equal(toCsv([{ sku: 'SKU-3', name: 'Shelf 12" deep', quantity: 2 }]).split('\r\n')[1], 'SKU-3,"Shelf 12"" deep",2');
});

test('quotes fields containing line breaks', () => {
  assert.equal(toCsv([{ sku: 'SKU-4', name: 'Cable tie\nblack', quantity: 9 }]), 'sku,name,quantity\r\nSKU-4,"Cable tie\nblack",9\r\n');
});

test('export --below keeps only items below the threshold', () => {
  const out = capture();
  run(['export', ITEMS, '--below', '5'], out);
  assert.equal(out.text, 'sku,name,quantity\r\nSKU-1002,"Washer, wide",3\r\n');
});

test('export without --below writes every item', () => {
  const out = capture();
  run(['export', ITEMS], out);
  assert.equal(out.text.trimEnd().split('\r\n').length, 4);
});
