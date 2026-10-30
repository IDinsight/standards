import assert from 'node:assert/strict';
import test from 'node:test';

import { CircuitOpenError, createBreaker } from '../src/breaker.js';

const fail = async () => { throw new Error('upstream'); };

test('opens after consecutive failures and rejects during the cooldown', async () => {
  let clock = 1000;
  const breaker = createBreaker({ threshold: 2, cooldownMs: 100, now: () => clock });
  await assert.rejects(breaker.run(fail), /upstream/);
  await assert.rejects(breaker.run(fail), /upstream/);
  assert.equal(breaker.state(), 'open');
  let called = false;
  await assert.rejects(breaker.run(async () => { called = true; }), CircuitOpenError);
  assert.equal(called, false);
  clock += 100;
  assert.equal(await breaker.run(async () => 'ok'), 'ok');
  assert.equal(breaker.state(), 'closed');
});

test('a success resets the failure count', async () => {
  const breaker = createBreaker({ threshold: 2, cooldownMs: 100 });
  await assert.rejects(breaker.run(fail), /upstream/);
  await breaker.run(async () => 'ok');
  await assert.rejects(breaker.run(fail), /upstream/);
  assert.equal(breaker.state(), 'closed');
});
