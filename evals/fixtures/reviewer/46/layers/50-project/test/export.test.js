import assert from 'node:assert/strict';
import test from 'node:test';

import { archiveName, toCsv } from '../src/export.js';

test('toCsv quotes fields that need it', () => {
  assert.equal(
    toCsv([{ id: '1', note: 'a,b' }, { id: '2', note: 'say "hi"' }]),
    'id,note\n1,"a,b"\n2,"say ""hi"""\n',
  );
});

test('archiveName uses the UTC date', () => {
  assert.equal(archiveName(new Date(Date.UTC(2026, 8, 3, 23, 30))), 'export-2026-09-03.csv');
});
