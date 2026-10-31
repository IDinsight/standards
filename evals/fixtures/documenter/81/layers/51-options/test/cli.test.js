import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs, run } from '../src/cli.js';

const DEFAULT_OUTPUT = [
  '2026-03-01T10:00:00Z [info] Server started on port 8080',
  '2026-03-01T10:00:03Z [info] Upload received: report.pdf',
  '2026-03-01T10:00:04Z [warn] Disk usage at 85%',
  '2026-03-01T10:00:07Z [error] Upload failed: timeout',
  '2026-03-01T10:00:09Z [info] Upload received: summary.csv',
].map((line) => `${line}\n`).join('');

test('prints info and above by default', () => {
  assert.equal(run(['examples/sample.log'], () => ''), DEFAULT_OUTPUT);
});

test('--count prints the number of kept lines', () => {
  assert.equal(run(['--count', 'examples/sample.log'], () => ''), '5\n');
});

test('--grep ignores case', () => {
  assert.equal(run(['--grep', 'upload', '--count', 'examples/sample.log'], () => ''), '3\n');
});

test('reads standard input when no file is given', () => {
  const input = '2026-03-01T10:00:00Z [error] Disk full\n';
  assert.equal(run(['--level', 'error'], () => input), input);
});

test('rejects unknown options', () => {
  assert.throws(() => parseArgs(['--verbose']), /unknown option/);
});

test('rejects an option without its value', () => {
  assert.throws(() => parseArgs(['--grep']), /missing option value/);
});
