import assert from 'node:assert/strict';
import test from 'node:test';

import { run } from '../src/cli.js';

function capture(argv) {
  let text = '';
  const code = run(argv, { write: (chunk) => { text += chunk; } });
  return { code, text };
}

test('prints usage with no arguments', () => {
  const { code, text } = capture([]);
  assert.equal(code, 0);
  assert.match(text, /^Usage: shelf <command>/);
});

test('prints usage for --help', () => {
  const { code, text } = capture(['--help']);
  assert.equal(code, 0);
  assert.match(text, /add <title>/);
});

test('rejects unknown commands', () => {
  const { code, text } = capture(['frobnicate']);
  assert.equal(code, 1);
  assert.match(text, /Unknown command: frobnicate/);
});
