import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs } from '../src/args.js';

test('defaults to counting lines from standard input', () => {
  assert.deepEqual(parseArgs([]), { mode: 'lines', json: false, help: false, files: [] });
});

test('reads mode flags, json, and files', () => {
  assert.deepEqual(parseArgs(['--words', '--json', 'a.txt', '-']),
    { mode: 'words', json: true, help: false, files: ['a.txt', '-'] });
});

test('repeating the same mode flag is allowed', () => {
  assert.equal(parseArgs(['-c', '--chars']).mode, 'chars');
});

test('conflicting mode flags are rejected', () => {
  assert.throws(() => parseArgs(['-l', '-w']), /only one/);
});

test('unknown options are rejected', () => {
  assert.throws(() => parseArgs(['--bytes']), /unknown option/);
});
