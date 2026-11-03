import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';
import { backoffDelay, deliver } from '../src/deliver.js';

// Answers each call with the next scripted status, or throws it if it is an Error.
function scripted(outcomes) {
  const calls = [];
  const send = async (event) => {
    calls.push(event.id);
    const next = outcomes[calls.length - 1];
    if (next instanceof Error) throw next;
    return { status: next };
  };
  return { send, calls };
}

function recordedSleep() {
  const waits = [];
  return { waits, sleep: async (ms) => { waits.push(ms); } };
}

test('retries 5xx responses until one succeeds', async () => {
  const { send, calls } = scripted([503, 502, 200]);
  const { waits, sleep } = recordedSleep();
  const result = await deliver({ id: 'evt_1' }, { send, sleep, config: loadConfig({}) });
  assert.deepEqual(result, { ok: true, attempts: 3, status: 200 });
  assert.equal(calls.length, 3);
  assert.deepEqual(waits, [500, 1000]);
});

test('stops at the configured maximum attempts', async () => {
  const { send, calls } = scripted([500, 500, 500]);
  const { waits, sleep } = recordedSleep();
  const result = await deliver({ id: 'evt_2' }, { send, sleep, config: loadConfig({ RELAY_MAX_ATTEMPTS: '2' }) });
  assert.deepEqual(result, { ok: false, attempts: 2, status: 500 });
  assert.equal(calls.length, 2);
  assert.deepEqual(waits, [500]);
});

test('retries 429 and network errors', async () => {
  const { send } = scripted([429, new Error('socket hang up'), 200]);
  const { sleep } = recordedSleep();
  const result = await deliver({ id: 'evt_3' }, { send, sleep, config: loadConfig({}) });
  assert.deepEqual(result, { ok: true, attempts: 3, status: 200 });
});

test('does not retry other client errors', async () => {
  const { send, calls } = scripted([404]);
  const { waits, sleep } = recordedSleep();
  const result = await deliver({ id: 'evt_4' }, { send, sleep, config: loadConfig({ RELAY_MAX_ATTEMPTS: '5' }) });
  assert.deepEqual(result, { ok: false, attempts: 1, status: 404 });
  assert.equal(calls.length, 1);
  assert.deepEqual(waits, []);
});

test('backoff doubles and is capped', () => {
  const config = loadConfig({ RELAY_BACKOFF_MS: '1000', RELAY_MAX_BACKOFF_MS: '3000' });
  assert.deepEqual([1, 2, 3, 4].map((attempt) => backoffDelay(attempt, config)), [1000, 2000, 3000, 3000]);
});

test('reads retry settings from the environment', () => {
  assert.deepEqual(loadConfig({}), { timeoutMs: 5000, maxAttempts: 3, backoffMs: 500, maxBackoffMs: 8000 });
  const config = loadConfig({ RELAY_MAX_ATTEMPTS: '5', RELAY_BACKOFF_MS: '250', RELAY_MAX_BACKOFF_MS: '4000' });
  assert.equal(config.maxAttempts, 5);
  assert.equal(config.backoffMs, 250);
  assert.equal(config.maxBackoffMs, 4000);
});

test('rejects an invalid retry setting', () => {
  assert.throws(() => loadConfig({ RELAY_MAX_ATTEMPTS: '0' }), /RELAY_MAX_ATTEMPTS/);
  assert.throws(() => loadConfig({ RELAY_BACKOFF_MS: '-5' }), /RELAY_BACKOFF_MS/);
  assert.throws(() => loadConfig({ RELAY_MAX_BACKOFF_MS: 'later' }), /RELAY_MAX_BACKOFF_MS/);
});
