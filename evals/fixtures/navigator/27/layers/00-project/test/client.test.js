import assert from 'node:assert/strict';
import test from 'node:test';

import { QuoteTimeoutError, fetchQuote } from '../src/client.js';

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

test('returns the parsed quote', async () => {
  const quote = await fetchQuote('http://upstream', 'ACME', { timeoutSeconds: 1, fetchImpl: fakeFetch([]) });
  assert.deepEqual(quote, { symbol: 'ACME', price: 101.5 });
});

test('raises QuoteTimeoutError when the service does not answer in time', async () => {
  await assert.rejects(
    fetchQuote('http://upstream', 'GLOBX', { timeoutSeconds: 0.05, fetchImpl: fakeFetch(['GLOBX']) }),
    QuoteTimeoutError,
  );
});
