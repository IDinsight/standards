# Project Context

## Project Baseline

- `relay` is a small Node.js service that accepts events on `POST /events` and
  forwards each one to a single webhook target (`TARGET_URL`), retrying failed
  deliveries.
- Before this cycle a failed delivery is retried a fixed three times
  (`MAX_RETRIES` in `src/deliver.js`) and then logged and discarded.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (package type module), no npm
  dependencies.
- Tests use `node:test` with explicit file arguments.

## Structure and Boundaries

- `bin/relay.js` — entry point: loads configuration, handles `--print-config`,
  starts the server, and wires delivery.
- `src/config.js` — `loadConfig(env)`: reads environment variables, validates
  integers with `positiveInt`, returns the configuration object.
- `src/deliver.js` — `deliver(send, delivery, options)` retry loop and
  `backoffMs`.
- `src/server.js` — HTTP intake for `POST /events`.
- `docs/operations.md` — operator guide: running, configuration table,
  `--print-config`, failed-delivery handling, restarts.
- `README.md` — commands and a link to the operations guide.

## Nearest Analogues

- `PORT` handling in `src/config.js` (default in `DEFAULTS`, validation through
  `positiveInt`) is the pattern for new numeric settings; `test/config.test.js`
  covers it.

## Commands

- `node --test test/config.test.js test/deliver.test.js` — full test suite
  (also `npm test`).
- `node bin/relay.js --print-config` — print the effective configuration as
  JSON and exit.

## Conventions and Constraints

- Configuration comes only from environment variables; an invalid value throws
  at startup with a message naming the variable.
- Delivery state is in memory only; pending retries are lost on restart, as
  `docs/operations.md` states.

## Testing and Verification Baseline

- `test/config.test.js` (2 tests) and `test/deliver.test.js` (3 tests) pass.
  `bin/relay.js` and `src/server.js` have no automated tests.

## Relevant Existing Behavior

- The Failed deliveries section of `docs/operations.md` documents the current
  three-retry, discard-on-failure behavior.

## Evidence

- `src/config.js`, `src/deliver.js`, `bin/relay.js`, `docs/operations.md`, and
  `test/` at the installation commit.
