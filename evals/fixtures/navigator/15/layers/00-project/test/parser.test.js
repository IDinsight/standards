import assert from 'node:assert/strict';
import test from 'node:test';

import { parse } from '../src/parser.js';

test('parses sections and keys', () => {
  assert.deepEqual(parse('[server]\nhost = localhost\nport = 8080\n\n[log]\nlevel=info\n'), {
    server: { host: 'localhost', port: '8080' },
    log: { level: 'info' },
  });
});

test('keeps keys before the first section under the empty name', () => {
  assert.deepEqual(parse('debug = true\n[server]\nport = 8080'), {
    '': { debug: 'true' },
    server: { port: '8080' },
  });
});

test('ignores comments and blank lines', () => {
  assert.deepEqual(parse('# comment\n; also a comment\n\n[a]\nx = 1\n'), { a: { x: '1' } });
});

test('reports the line of a line without =', () => {
  assert.throws(() => parse('[a]\nnovalue'), /line 2: expected key = value/);
});
