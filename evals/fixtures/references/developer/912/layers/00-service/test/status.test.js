import assert from 'node:assert/strict';
import test from 'node:test';

import { statusPayload } from '../src/status.js';

test('reports version and whole seconds of uptime', () => {
  const payload = statusPayload({ version: '1.2.0', startedAt: 1_000, now: 4_750 });
  assert.deepEqual(payload, { status: 'ok', version: '1.2.0', uptimeSeconds: 3 });
});

test('never reports negative uptime', () => {
  const payload = statusPayload({ version: '1.2.0', startedAt: 5_000, now: 4_000 });
  assert.equal(payload.uptimeSeconds, 0);
});
