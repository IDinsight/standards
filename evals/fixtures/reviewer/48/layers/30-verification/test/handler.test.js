import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/app.js';
import { createDirectory } from '../src/directory.js';
import { handleLookup } from '../src/handler.js';
import { createRateLimiter } from '../src/rateLimiter.js';

const directory = createDirectory();

function manualClock(start = 0) {
  let time = start;
  return { now: () => time, advance: (ms) => { time += ms; } };
}

test('returns the office for a known code', () => {
  const res = handleLookup({ clientId: 'kiosk-1', query: { code: 'LDN' } }, { directory });
  assert.equal(res.status, 200);
  assert.equal(res.body.timezone, 'Europe/London');
});

test('rejects a missing code', () => {
  assert.equal(handleLookup({ clientId: 'kiosk-1', query: {} }, { directory }).status, 400);
});

test('returns 404 for an unknown code', () => {
  assert.equal(handleLookup({ clientId: 'kiosk-1', query: { code: 'XYZ' } }, { directory }).status, 404);
});

test('returns 429 with Retry-After once a client exceeds 60 requests in a minute', () => {
  const clock = manualClock();
  const app = createApp({ now: clock.now });
  for (let i = 0; i < 60; i += 1) {
    assert.equal(app.lookup({ clientId: 'kiosk-1', query: { code: 'LDN' } }).status, 200);
  }
  clock.advance(15_000);
  const res = app.lookup({ clientId: 'kiosk-1', query: { code: 'LDN' } });
  assert.equal(res.status, 429);
  assert.equal(res.headers['Retry-After'], '45');
});

test('counts each client separately', () => {
  const limiter = createRateLimiter({ now: () => 0 });
  for (let i = 0; i < 60; i += 1) {
    handleLookup({ clientId: 'kiosk-1', query: { code: 'LDN' } }, { directory, limiter });
  }
  const other = handleLookup({ clientId: 'kiosk-2', query: { code: 'NBO' } }, { directory, limiter });
  assert.equal(other.status, 200);
  assert.deepEqual(other.body, directory.find('NBO'));
  assert.equal(handleLookup({ clientId: 'kiosk-1', query: { code: 'LDN' } }, { directory, limiter }).status, 429);
});

test("serves lookups again once the client's minute has passed", () => {
  const clock = manualClock();
  const limiter = createRateLimiter({ now: clock.now });
  const req = { clientId: 'kiosk-1', query: { code: 'DEL' } };
  for (let i = 0; i < 60; i += 1) handleLookup(req, { directory, limiter });
  assert.equal(handleLookup(req, { directory, limiter }).status, 429);
  clock.advance(60_000);
  assert.equal(handleLookup(req, { directory, limiter }).status, 200);
});
