<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: lookup-rate-limit-20260924T090000Z-3e8a51c7
-->

# Technical Design

## Context

`src/handler.js` exposes `handleLookup(req, deps)` and `src/app.js` wires it for
the gateway. Requests carry `clientId` from the gateway. The service is a single
process with no external store (see `.standards/CONTEXT.md`). No project
references apply.

## Decision

Add an in-memory fixed-window limiter in a new module `src/rateLimiter.js`,
injected into `handleLookup` as an optional `limiter` dependency and always
created by `createApp`. The limiter is checked before the code is validated, so
every request, including malformed ones, counts toward the limit. A fixed window
is chosen over a sliding log because the scope only requires a per-minute
ceiling and a fixed window keeps one small entry per client.

## Acceptance Coverage

- `AC-001`: `createRateLimiter` keeps a fixed window of 60 requests per
  60000 ms per client; `handleLookup` returns 429 when `check` denies;
  `createApp` always supplies the limiter.
- `AC-002`: `check` returns `retryAfterSeconds`; the handler sets the
  `Retry-After` header to its decimal string.
- `AC-003`: windows are keyed by `clientId`; allowed requests continue on the
  unchanged lookup path.

## Components

- `src/rateLimiter.js` — per-client request counting and the allow/deny
  decision.
- `src/handler.js` — consults the limiter, then performs the existing lookup.
- `src/app.js` — production wiring of directory and limiter.

## Interfaces and Contracts

- `createRateLimiter({ limit = 60, windowMs = 60000, now = Date.now })` returns
  `{ check(clientId) }`. `now` is injectable so tests control time.
- `check(clientId)` returns `{ allowed, remaining, retryAfterSeconds }`. A
  window starts at a client's first request after its previous window ended;
  that request counts as 1. Requests numbered above `limit` in the window are
  denied with `retryAfterSeconds = max(1, ceil((windowStart + windowMs - now) / 1000))`.
  A window ends when `now >= windowStart + windowMs`.
- A missing `clientId` (undefined or null) is counted under one shared key,
  `anonymous`.
- `handleLookup(req, { directory, limiter })`: when `limiter` is present and
  denies, respond with status 429, a `Retry-After` header, and body
  `{ error: 'too many requests' }`. Without a limiter, or when allowed, behavior
  is unchanged.

## Data and Control Flow

Gateway request -> `createApp().lookup(req)` -> `limiter.check(req.clientId)` ->
429 response, or the existing validation and directory lookup.

## Technical Acceptance Criteria

- `AC-001`: The 61st request from a client within 60000 ms of its window start
  is answered 429, and the first request at or after window start plus 60000 ms
  starts a new window and is served normally.
- `AC-002`: `Retry-After` is a decimal integer string of at least 1, equal to
  the seconds remaining in the client's window rounded up.
- `AC-003`: One client's count never affects another's; an allowed request
  returns the same status and body as the handler without a limiter.

## Build Plan

1. CREATE `src/rateLimiter.js` with the contract above.
2. MODIFY `src/handler.js` and `src/app.js` together so the production path
   always enforces the limit.

## Risks and Follow-up

- Memory grows with the number of distinct client ids. The gateway uses a fixed
  set of API keys, so no eviction is added in this cycle.
