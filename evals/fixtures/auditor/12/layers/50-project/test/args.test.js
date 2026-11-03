import assert from 'node:assert/strict';
import test from 'node:test';

import { UsageError, parseArgs } from '../src/args.js';

test('defaults to text format', () => {
  const options = parseArgs(['app.log']);
  assert.equal(options.file, 'app.log');
  assert.equal(options.format, 'text');
});

test('accepts --format and -f', () => {
  assert.equal(parseArgs(['--format', 'json', 'app.log']).format, 'json');
  assert.equal(parseArgs(['app.log', '-f', 'json']).format, 'json');
});

test('rejects an unsupported format', () => {
  assert.throws(() => parseArgs(['app.log', '--format', 'xml']), UsageError);
});

test('rejects unknown options and a missing file', () => {
  assert.throws(() => parseArgs(['--verbose', 'app.log']), UsageError);
  assert.throws(() => parseArgs([]), UsageError);
});
