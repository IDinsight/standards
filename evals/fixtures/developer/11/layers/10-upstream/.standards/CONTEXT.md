# Project Context

## Project Baseline

- `records` is an in-memory record store with a small request router used by
  internal tools. Records have `id`, `title`, and `body`. Callers create, read,
  list (with a `q` title search), update, and delete them one at a time.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/store.js` — `RecordStore`: an in-memory Map keyed by numeric id. Every
  method returns copies.
- `src/handlers.js` — request handlers returning `{ status, body }`. Input
  validation and the 400/404 mapping live here.
- `src/routes.js` — `route(store, method, path, body, query)`, the externally
  visible API surface. Every endpoint is registered in its route table.
- `test/records.test.js` — route-level tests.

## Commands

- `npm test` — runs `node --test test/records.test.js` from the project root.

## Conventions and Constraints

- Handlers never throw for client errors; they return 400 or 404 with
  `{ error }`.
- Store methods return copies so callers cannot mutate stored records.
- The API is documented in the README route table.

## Testing and Verification Baseline

- Five route-level `node:test` tests cover create, title validation, list
  search, update, and single-record delete. All pass.

## Relevant Existing Behavior

- `GET /records` returns every record, filtered by `q` when given.
- `GET /records/:id` returns 404 for unknown or malformed ids.
- `DELETE /records/:id` removes one record (204) and returns 404 for unknown
  ids.

## Evidence

- `node --test test/records.test.js` at ${COMMIT:Initial records service}: 5
  passed, 0 failed.
- `src/routes.js`, `src/handlers.js`, `src/store.js`, `README.md` — read in full.
