# Project Context

## Project Baseline

- rates-client 1.4.0: a small Node library that wraps a caller-supplied
  `fetchRate(base, quote)` provider function with an in-memory cache. It has no
  network code of its own.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies, no build step.

## Structure and Boundaries

- `src/client.js`: `RatesClient`. Normalizes currency codes to upper case,
  builds the cache key `BASE/QUOTE`, returns a cached rate when one is present,
  otherwise calls `fetchRate` and stores the result. `clearCache()` empties the
  cache.
- `src/cache.js`: `RateCache`. In-memory `Map` keyed by currency pair; options
  `ttlSeconds` (default 300), `maxEntries` (default 500), and an injectable
  `now` clock; `prune()` handles removal of old entries.
- `src/index.js`: public exports (`RatesClient`, `RateCache`).
- `README.md`: the only existing user-facing documentation; its Configuration
  section lists the constructor options. There is no `docs/` folder yet.

## Commands

- `npm test` (runs `node --test test/cache.test.js test/client.test.js`): the
  unit tests.

## Conventions and Constraints

- The public API is what `src/index.js` exports. Options are passed to the
  `RatesClient` constructor and forwarded to `RateCache`.

## Testing and Verification Baseline

- `test/cache.test.js` covers storage, pruning once the cache exceeds
  `maxEntries`, and oldest-first eviction.
- `test/client.test.js` covers caching per pair, case normalization, and
  `clearCache()`.

## Relevant Existing Behavior

- The README describes `ttlSeconds` as the "cache lifetime in seconds (default
  300)" and `maxEntries` as the number of cached pairs before old entries are
  pruned.

## Evidence

- `src/cache.js`, `src/client.js`, `src/index.js`, `README.md`, `test/`: read
  for this cycle.
- `node --test test/cache.test.js test/client.test.js` in the project root: 6
  passing tests.
