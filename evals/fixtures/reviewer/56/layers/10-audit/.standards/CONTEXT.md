# Project Context

## Project Baseline

- `archivekeep` is a small library used by the nightly export cleanup job to
  load its configuration and decide which export archives have expired. It has
  no CLI; callers import the modules directly.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/config.js` — `DEFAULTS` and `loadConfig(overrides)`, which merges
  overrides over the defaults and validates them.
- `src/prune.js` — `selectExpired(entries, now, config)`, which applies the
  retention period to `{ name, createdAt }` entries.
- `test/` — `node:test` suites; `test/fixtures/defaults.json` mirrors the
  expected defaults.
- `README.md` — the only user-facing documentation.

## Commands

- `npm test` — runs `node --test test/config.test.js test/prune.test.js` from
  the project root.

## Conventions and Constraints

- Option defaults are defined once, in `DEFAULTS` in `src/config.js`;
  `test/config.test.js` compares `loadConfig()` with the fixture.

## Testing and Verification Baseline

- Five tests across two files; all pass on the current tree.

## Relevant Existing Behavior

- `loadConfig` throws `RangeError` when `retentionDays` is not a positive
  integer and `TypeError` when `archiveDir` is empty or not a string;
  `compress` is converted to a boolean.
- `selectExpired` returns the names of entries whose `createdAt` is earlier
  than `now` minus `retentionDays` × 24 hours.

## Evidence

- `src/config.js`, `src/prune.js`, `test/config.test.js`,
  `test/prune.test.js`, `test/fixtures/defaults.json`, `README.md`.
- `npm test` — exit 0, 5 passed.
