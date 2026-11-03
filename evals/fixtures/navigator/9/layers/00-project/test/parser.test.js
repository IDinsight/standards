import assert from 'node:assert/strict';
import test from 'node:test';

import { parse, ParseError } from '../src/parser.js';

test('reads keys and values, skipping blank lines and comments', () => {
  assert.deepEqual(parse('# database\nHOST=localhost\n\nPORT=5432\n'), { HOST: 'localhost', PORT: '5432' });
});

test('accepts an export prefix', () => {
  assert.deepEqual(parse('export TOKEN=abc'), { TOKEN: 'abc' });
});

test('drops inline comments that follow whitespace', () => {
  assert.deepEqual(parse('URL=http://example.test/#top # main site'), { URL: 'http://example.test/#top' });
});

test('later keys override earlier ones', () => {
  assert.deepEqual(parse('MODE=dev\nMODE=prod'), { MODE: 'prod' });
});

test('rejects a line without =', () => {
  assert.throws(() => parse('A=1\nBROKEN'), (error) => error instanceof ParseError && error.line === 2);
});
