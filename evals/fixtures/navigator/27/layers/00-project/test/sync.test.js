import assert from 'node:assert/strict';
import test from 'node:test';

import { syncQuotes } from '../src/sync.js';

// Answers immediately, except for symbols in `slow`, which never answer until aborted.
function fakeFetch(slow) {
  return (url, { signal }) => new Promise((resolve, reject) => {
    const symbol = url.split('/').pop();
    if (slow.includes(symbol)) {
      signal.addEventListener('abort', () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        reject(error);
      });
      return;
    }
    resolve({ ok: true, status: 200, json: async () => ({ symbol, price: 101.5 }) });
  });
}

test('collects quotes and reports symbols that timed out', async () => {
  const config = { upstream: { baseUrl: 'http://upstream', timeoutSeconds: 0.05 }, symbols: ['ACME', 'GLOBX'] };
  const result = await syncQuotes(config, { fetchImpl: fakeFetch(['GLOBX']) });
  assert.deepEqual(result, { quotes: { ACME: { symbol: 'ACME', price: 101.5 } }, timedOut: ['GLOBX'] });
});
