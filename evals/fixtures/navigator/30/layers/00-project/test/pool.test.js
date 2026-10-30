import assert from 'node:assert/strict';
import test from 'node:test';

import { Pool } from '../src/pool.js';
import { TimeoutError } from '../src/timeout.js';

test('grants slots up to the pool size', async () => {
  const pool = new Pool({ size: 2, acquireTimeoutMs: 50 });
  await pool.acquire();
  await pool.acquire();
  assert.equal(pool.inUse, 2);
});

test('a released slot goes to the next waiter', async () => {
  const pool = new Pool({ size: 1, acquireTimeoutMs: 200 });
  await pool.acquire();
  const waiting = pool.acquire();
  pool.release();
  await waiting;
  assert.equal(pool.inUse, 1);
  assert.equal(pool.waiters.length, 0);
});

test('acquire rejects with TimeoutError when no slot frees up', async () => {
  const pool = new Pool({ size: 1, acquireTimeoutMs: 20 });
  await pool.acquire();
  await assert.rejects(pool.acquire(), TimeoutError);
  assert.equal(pool.waiters.length, 0);
});
