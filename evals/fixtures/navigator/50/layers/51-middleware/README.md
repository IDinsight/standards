# throttle-api

Small HTTP service that rate-limits each client with a token bucket.

## Running

```sh
npm start
```

Listens on `PORT` (default 3000).

## Rate limits

Each client IP address gets its own bucket. A client can send a burst of up to
`capacity` requests; tokens then come back at `refillPerSecond`. Refused
requests get `429 Too Many Requests` with a `Retry-After` header. The limits
live in `src/config.js`.

## Tests

```sh
npm test
```
