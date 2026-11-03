import assert from 'node:assert/strict';
import test from 'node:test';

import { createBreaker } from '../src/breaker.js';
import { createQuoteHandler } from '../src/quotes.js';
import { RatesHttpError, RatesTimeoutError } from '../src/rates-client.js';

function handler(getRates, breaker = createBreaker({ threshold: 5, cooldownMs: 1000 })) {
  const warnings = [];
  const handle = createQuoteHandler({ breaker, rates: { getRates }, log: { warn: (message) => warnings.push(message) } });
  return { handle, warnings };
}

const request = { origin: '10001', destination: '94105', weightGrams: 1200 };

test('returns quotes cheapest first', async () => {
  const { handle } = handler(async () => ({ rates: [{ service: 'express', cents: 2450 }, { service: 'ground', cents: 899 }] }));
  assert.deepEqual(await handle(request), {
    status: 200,
    body: { quotes: [{ service: 'ground', priceCents: 899 }, { service: 'express', priceCents: 2450 }] },
  });
});

test('rejects incomplete requests', async () => {
  const { handle } = handler(async () => { throw new Error('not expected'); });
  assert.deepEqual(await handle({ origin: '10001' }), { status: 400, body: { error: 'invalid_request' } });
});

test('maps upstream timeouts to 504', async () => {
  const { handle, warnings } = handler(async () => { throw new RatesTimeoutError('no response within 4000ms'); });
  assert.deepEqual(await handle(request), { status: 504, body: { error: 'rates_unavailable' } });
  assert.deepEqual(warnings, ['quote failed status=504 error=rates_unavailable']);
});

test('maps an open circuit to 504 without calling upstream', async () => {
  let calls = 0;
  const breaker = createBreaker({ threshold: 1, cooldownMs: 60000 });
  const { handle } = handler(async () => { calls += 1; throw new RatesTimeoutError('slow'); }, breaker);
  await handle(request);
  assert.deepEqual(await handle(request), { status: 504, body: { error: 'rates_unavailable' } });
  assert.equal(calls, 1);
});

test('maps upstream server errors to 502', async () => {
  const { handle, warnings } = handler(async () => { throw new RatesHttpError(503); });
  assert.deepEqual(await handle(request), { status: 502, body: { error: 'rates_error' } });
  assert.deepEqual(warnings, ['quote failed status=502 error=rates_error']);
});
