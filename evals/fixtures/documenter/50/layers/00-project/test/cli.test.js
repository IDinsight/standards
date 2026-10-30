import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs, run } from '../src/cli.js';

test('parseArgs selects all counts by default', () => {
  assert.deepEqual(parseArgs(['notes.txt']), { fields: ['lines', 'words', 'chars'], files: ['notes.txt'] });
});

test('parseArgs rejects unknown options', () => {
  assert.throws(() => parseArgs(['--bytes']), /unknown option: --bytes/);
});

test('run prints the selected count with the file name', () => {
  const written = [];
  const io = { out: (text) => written.push(text), err: () => {}, read: () => 'one two three\n' };
  assert.equal(run(['--words', 'notes.txt'], io), 0);
  assert.deepEqual(written, ['      3 notes.txt\n']);
});
