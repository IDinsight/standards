<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: delivery-retry-limit-20260924T081500Z-6b1e9d4a
-->

# Technical Design

## Context

Configuration is read once at startup by `loadConfig` in `src/config.js`;
delivery retries live in `deliver` in `src/deliver.js`, wired by
`bin/relay.js`. See `.standards/CONTEXT.md`.

## Decision

- Extend `loadConfig` with `retryLimit` (from `RETRY_LIMIT`, validated with the
  existing `positiveInt`, default 5) and `deadLetterPath` (from
  `DEAD_LETTER_PATH`, default `data/dead-letter.jsonl`). The returned object
  keeps `port` and `targetUrl` first so `--print-config` output stays stable
  for existing readers.
- `deliver` takes `retryLimit` and a `deadLetter(entry)` callback instead of
  the fixed `MAX_RETRIES` and log callback. A delivery gets `retryLimit + 1`
  attempts; the wait before retry n is `backoffMs(n)`: 1 second, doubling,
  capped at 30 seconds.
- New `src/deadLetter.js` exports `appendDeadLetter(file, entry)`, which
  creates the parent folder and appends the entry plus a `failedAt` ISO 8601
  UTC timestamp as one JSON line. Entries carry `id`, `event`, `error`,
  `attempts`, and `failedAt`.
- `deliver` resolves with status `dead-lettered` after writing the entry;
  `bin/relay.js` keeps logging the delivery status and attempt count.

## Acceptance Coverage

- `AC-001`: `loadConfig` default and validation for `RETRY_LIMIT`; `deliver`
  takes its attempt count from `retryLimit`.
- `AC-002`: No architectural impact — Documenter updates `docs/operations.md`
  from the implemented behavior.
- `AC-003`: `deliver` calls `deadLetter` after the final failed attempt;
  `appendDeadLetter` writes one JSON object per line to `deadLetterPath`.

## Technical Acceptance Criteria

- `AC-001`: `loadConfig({})` returns `retryLimit: 5`; `RETRY_LIMIT=0` or a
  non-integer throws an `Error` whose message starts with
  `RETRY_LIMIT must be a positive integer`.
- `AC-001`: With `retryLimit: n`, `send` is called at most `n + 1` times.
- `AC-003`: After the last failed attempt, exactly one entry with `id`,
  `error`, and `attempts` is passed to `deadLetter`, and `appendDeadLetter`
  appends exactly one line per entry.

## Build Plan

1. MODIFY `src/config.js`: add `retryLimit` and `deadLetterPath`.
2. MODIFY `src/deliver.js`, CREATE `src/deadLetter.js`, MODIFY `bin/relay.js`:
   replace the drop path with the dead-letter callback.

## Risks and Follow-up

- The dead-letter file grows without bound; rotation is left to operators and
  is outside this cycle.
