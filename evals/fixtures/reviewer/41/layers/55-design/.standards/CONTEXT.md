# Project Context

## Project Baseline

- `hookrelay` is a small internal Node.js library that delivers webhook events
  for the dispatcher service. Each event is sent once; any non-2xx response or
  thrown error is reported as a failure.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  dev dependencies.

## Structure and Boundaries

- `src/relay.js` — `relayBatch(events, { send, config, log })`; loads config
  from the environment when none is passed and logs one line per event.
- `src/deliver.js` — `deliver(event, { send, config })` returns
  `{ ok, attempts, status }`, plus `error` when `send` threw.
- `src/http.js` — `httpSender(url)` posts JSON with `fetch` and
  `AbortSignal.timeout`; a timeout or network error rejects.
- `src/config.js` — `loadConfig(env)` reads `RELAY_*` integer settings through
  `readInt()` and throws an error naming the variable on an invalid value.
- `docs/operations.md` — operator guide: configuration and log format.

## Commands

- `npm test` — runs `node --test` on the test files listed in `package.json`.

## Conventions and Constraints

- No dependencies. `send` is injected so tests never touch the network.
- The `deliver()` result is consumed by `relayBatch()` and the dispatcher's
  metrics; `ok`, `attempts`, and `status` are relied on.

## Testing and Verification Baseline

- `test/config.test.js` (2 tests) and `test/deliver.test.js` (3 tests) use
  `node:test` with a stubbed `send`. All pass.

## Relevant Existing Behavior

- `status=0` in results and logs means no response was received.
- The operations guide states that `attempts` is always 1.

## Evidence

- `src/*.js`, `test/*.js`, `package.json`, and `docs/operations.md` at the
  installation commit.
