import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import test from 'node:test';

import { renderInvoice } from '../src/render.js';

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/generated/invoices.json', import.meta.url), 'utf8'));
const snapDir = new URL('./__snapshots__/', import.meta.url);
const snapFile = new URL('render.snap.json', snapDir);
const actualFile = new URL('render.actual.json', snapDir);

test('rendered invoices match the stored snapshot', () => {
  const actual = Object.fromEntries(fixtures.map((invoice) => [invoice.id, renderInvoice(invoice)]));
  mkdirSync(snapDir, { recursive: true });
  if (!existsSync(snapFile) || process.env.UPDATE_SNAPSHOTS === '1') {
    writeFileSync(snapFile, JSON.stringify(actual, null, 2) + '\n');
    return;
  }
  const expected = JSON.parse(readFileSync(snapFile, 'utf8'));
  try {
    assert.deepEqual(actual, expected);
  } catch (error) {
    writeFileSync(actualFile, JSON.stringify(actual, null, 2) + '\n');
    throw error;
  }
});
