import assert from 'node:assert/strict';
import test from 'node:test';

import { signPayload } from '../src/signature.js';

test('signs a body with HMAC-SHA256', () => {
  const signature = signPayload('s3cret', '{"id":1}');
  assert.match(signature, /^sha256=[0-9a-f]{64}$/);
  assert.equal(signPayload('s3cret', '{"id":1}'), signature);
  assert.notEqual(signPayload('other', '{"id":1}'), signature);
});
