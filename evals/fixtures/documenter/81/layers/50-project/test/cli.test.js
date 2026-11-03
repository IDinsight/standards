import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs, run } from '../src/cli.js';

test('prints warn and error lines by default', () => {
  assert.equal(run(['examples/sample.log'], () => ''),
    '2026-03-01T10:00:04Z [warn] Disk usage at 85%\n2026-03-01T10:00:07Z [error] Upload failed: timeout\n');
});

test('reads standard input when no file is given', () => {
  const input = '2026-03-01T10:00:00Z [error] Disk full\n';
  assert.equal(run(['--level', 'error'], () => input), input);
});

test('rejects unknown options', () => {
  assert.throws(() => parseArgs(['--verbose']), /unknown option/);
});
