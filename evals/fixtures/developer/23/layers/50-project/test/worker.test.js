import assert from 'node:assert/strict';
import test from 'node:test';

import { issueToken } from '../src/auth/token.js';
import { processJob } from '../src/worker/consumer.js';

const secret = 'test-secret';
const handlers = { resize: (data, claims) => `${claims.sub}:${data.width}` };

test('job with a valid token runs its handler', () => {
  const token = issueToken({ sub: 'u3' }, secret);
  const result = processJob({ type: 'resize', token, data: { width: 200 } }, { secret, handlers });
  assert.deepEqual(result, { status: 'done', output: 'u3:200' });
});

test('job with a bad token is rejected', () => {
  const token = issueToken({ sub: 'u3' }, 'other-secret');
  const result = processJob({ type: 'resize', token, data: {} }, { secret, handlers });
  assert.deepEqual(result, { status: 'rejected', reason: 'signature' });
});
