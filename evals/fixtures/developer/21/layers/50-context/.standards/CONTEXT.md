# Project Context

## Project Baseline

- `admin-console` is a small Node.js module holding admin records for the
  internal console: creation, partial updates, and a fixed response shape.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/records.js` — validation and normalization of records (`createRecord`,
  `updateRecord`) and the response shape (`toResponse`).
- `src/store.js` — `RecordStore`, an in-memory map keyed by `id` with optional
  JSON file load and save.
- `src/api.js` — handlers returning `[status, body]` tuples.

## Commands

- `npm test` — runs `node --test test/records.test.js` from the project root.

## Conventions and Constraints

- Handlers do not throw for invalid input: `createRecord` raises `TypeError`
  and `postRecord` maps it to status 400.
- Responses are built only through `toResponse`, which lists every exposed
  field explicitly.

## Testing and Verification Baseline

- `test/records.test.js` covers creation with normalization, missing-field
  rejection, partial updates, and unknown-record lookups.

## Evidence

- `package.json`, `src/`, `test/records.test.js`.
