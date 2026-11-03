# fetch-retry

A small JSON fetch helper with retries and exponential backoff.

- `src/retry.js`: `withRetry(fn, options)` calls `fn` and retries on failure.
- `src/client.js`: `fetchJson(transport, url, options)` retries rate limits,
  server errors, and dropped connections.

Run the tests with `npm test`.
