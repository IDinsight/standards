# gateway-limiter

Per-client request limiting for the API gateway.

- `src/limiter.js`: `TokenBucket`, which refills a fixed number of tokens per
  interval, up to its capacity.
- `src/middleware.js`: `createLimiter()`, which keeps one bucket per client and
  answers `{ status: 200 }` or `{ status: 429, retryAfterMs }`.

Defaults: 10 requests per client, refilled every 1000 ms.

Run the tests with `npm test`.
