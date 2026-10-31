import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { tally } from '../src/count.js';

test('counts an empty string as zero', () => {
  assert.deepEqual(tally(''), { lines: 0, words: 0, chars: 0 });
});

test('counts lines with and without a trailing newline', () => {
  assert.equal(tally('a\nb\n').lines, 2);
  assert.equal(tally('a\nb').lines, 2);
});

test('counts words separated by any whitespace', () => {
  assert.equal(tally('one  two\tthree\nfour').words, 4);
});

test('rejects an unknown option', () => {
  const result = spawnSync(process.execPath, ['src/cli.js', '--bytes', 'README.md'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /unknown option --bytes/);
});
