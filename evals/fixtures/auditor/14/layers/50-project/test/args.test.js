import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs } from '../src/args.js';

test('uses defaults when only files are given', () => {
  assert.deepEqual(parseArgs(['app.log']), {
    level: 'debug', since: null, top: 5, files: ['app.log'], help: false, version: false,
  });
});

test('parses level, since, and top', () => {
  const options = parseArgs(['--level', 'WARN', '--since', '2026-09-01T08:20:00Z', '--top', '3', 'a.log', 'b.log']);
  assert.equal(options.level, 'warn');
  assert.equal(options.since, Date.parse('2026-09-01T08:20:00Z'));
  assert.equal(options.top, 3);
  assert.deepEqual(options.files, ['a.log', 'b.log']);
});

test('rejects unknown options', () => {
  assert.throws(() => parseArgs(['--verbose']), /unknown option: --verbose/);
});

test('rejects a missing value', () => {
  assert.throws(() => parseArgs(['--top']), /missing value for --top/);
});

test('rejects an unknown level', () => {
  assert.throws(() => parseArgs(['--level', 'trace']), /unknown level: trace/);
});
