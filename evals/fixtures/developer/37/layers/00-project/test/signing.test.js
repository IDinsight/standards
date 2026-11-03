import assert from 'node:assert/strict';
import test from 'node:test';

import { sign, verify } from '../src/signing.js';

test('sign produces a sha256-prefixed hex digest', () => {
  assert.match(sign('{}', 'secret'), /^sha256=[0-9a-f]{64}$/);
});

test('verify accepts its own signature and rejects a changed body', () => {
  const signature = sign('{"a":1}', 'secret');
  assert.equal(verify('{"a":1}', 'secret', signature), true);
  assert.equal(verify('{"a":2}', 'secret', signature), false);
});
