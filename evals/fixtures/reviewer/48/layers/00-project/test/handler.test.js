import assert from 'node:assert/strict';
import test from 'node:test';

import { createDirectory } from '../src/directory.js';
import { handleLookup } from '../src/handler.js';

const directory = createDirectory();

test('returns the office for a known code', () => {
  const res = handleLookup({ clientId: 'kiosk-1', query: { code: 'LDN' } }, { directory });
  assert.equal(res.status, 200);
  assert.equal(res.body.timezone, 'Europe/London');
});

test('rejects a missing code', () => {
  assert.equal(handleLookup({ clientId: 'kiosk-1', query: {} }, { directory }).status, 400);
});

test('returns 404 for an unknown code', () => {
  assert.equal(handleLookup({ clientId: 'kiosk-1', query: { code: 'XYZ' } }, { directory }).status, 404);
});
