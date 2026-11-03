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

test('quoted value keeps inner whitespace', () => {
  assert.deepEqual(parse('[a]\nname = "  padded  "'), { a: { name: '  padded  ' } });
});

test('quoted value decodes escapes', () => {
  assert.deepEqual(parse(String.raw`msg = "say \"hi\"\tthen\\\n"`), { '': { msg: 'say "hi"\tthen\\\n' } });
});

test('rejects an unterminated quoted value', () => {
  assert.throws(() => parse('[a]\nx = "open'), /line 2: unterminated quoted value/);
});

test('rejects text after the closing quote', () => {
  assert.throws(() => parse('x = "a" b'), /line 1: unexpected text after closing quote/);
});

test('rejects an unknown escape', () => {
  assert.throws(() => parse(String.raw`x = "\q"`), /line 1: unknown escape/);
});

test('unquoted values are unchanged', () => {
  assert.deepEqual(parse('[a]\npath = C:\\temp\nnote = say "hi"'), {
    a: { path: 'C:\\temp', note: 'say "hi"' },
  });
});
