# Project Context

## Project Baseline

- hookrelay is a small Node module that posts webhook events to one endpoint
  and retries failed deliveries with exponential backoff. No HTTP transport is
  bundled; callers pass a `send` function.

## Stack and Tooling

- Node 22, plain JavaScript ES modules, no dependencies. Tests use `node:test`.

## Structure and Boundaries

- `src/config.js` — reads `WEBHOOK_ENDPOINT` and `WEBHOOK_BACKOFF_MS` from the
  environment.
- `src/delivery.js` — retry loop; the attempt limit is the constant
  `MAX_ATTEMPTS = 5`.
- `src/worker.js` — `createWorker` loads configuration once and wires it to
  `deliver`.
- `test/` — configuration and delivery tests.
- `README.md`, `CONTRIBUTING.md` — the README points to CONTRIBUTING.md, which
  holds local setup, the configuration table, and the retry description.

## Nearest Analogues

- `WEBHOOK_BACKOFF_MS` in `src/config.js` — existing environment setting read
  at worker creation and passed to `deliver` as an option.

## Commands

- `npm test` — runs `node --test test/config.test.js test/delivery.test.js`.

## Conventions and Constraints

- Configuration comes only from environment variables read when the worker is
  created.

## Testing and Verification Baseline

- 4 tests, all passing at the audited commit.

## Evidence

- `package.json`, `src/*.js`, `test/*.js`, `README.md`, `CONTRIBUTING.md`.
