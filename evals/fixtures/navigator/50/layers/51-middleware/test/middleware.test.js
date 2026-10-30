import assert from 'node:assert/strict';
import test from 'node:test';

import { rateLimit } from '../src/middleware.js';

function request(ip) {
  return { socket: { remoteAddress: ip } };
}

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = body; },
  };
}

test('refuses with 429 and Retry-After once the bucket is empty', () => {
  const limit = rateLimit({ capacity: 1, refillPerSecond: 1, now: () => 0 });
  let passed = 0;
  limit(request('10.0.0.1'), response(), () => { passed += 1; });
  const res = response();
  limit(request('10.0.0.1'), res, () => { passed += 1; });
  assert.equal(passed, 1);
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers['Retry-After'], '1');
});

test('keeps a separate bucket for each client address', () => {
  const limit = rateLimit({ capacity: 1, refillPerSecond: 1, now: () => 0 });
  let passed = 0;
  limit(request('10.0.0.1'), response(), () => { passed += 1; });
  limit(request('10.0.0.2'), response(), () => { passed += 1; });
  assert.equal(passed, 2);
});
