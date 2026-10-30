# ratelimit

Per-client request rate limiting for `node:http` servers, built on a token
bucket.

## Usage

```js
import http from 'node:http';
import { RateLimiter } from './src/limiter.js';
import { withRateLimit } from './src/http.js';

const limiter = new RateLimiter({ capacity: 10, refillPerSecond: 1 });
http.createServer(withRateLimit(limiter, (req, res) => res.end('ok'))).listen(8080);
```

Each client (by `X-Client-Id`, else remote address) gets its own bucket of
`capacity` tokens that refills at `refillPerSecond`. A request that finds the
bucket empty gets `429 Too Many Requests` with a `Retry-After` header in
seconds. At most `maxKeys` clients are tracked; the oldest is dropped first.

## Layout

- `src/bucket.js`: the token bucket.
- `src/limiter.js`: one bucket per client key.
- `src/http.js`: the request handler wrapper.

## Tests

`npm test`
