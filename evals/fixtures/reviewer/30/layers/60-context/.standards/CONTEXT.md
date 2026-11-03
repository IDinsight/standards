# Project Context

## Project Baseline

- `ledger` is the invoice ledger service for finance. Invoices are stored in a
  libSQL server (`sqld`) reached over its HTTP pipeline API (Hrana over HTTP)
  through the hand-written client in `src/db/client.js`; the project has no
  npm dependencies.
- Current behavior: validating and recording invoices (`recordInvoice`) and
  listing them. There is no export feature and no notion of an exported
  invoice.

## Stack and Tooling

- Node 22, plain JavaScript ES modules, no build step, no typechecker or
  linter. npm scripts only; there is no lockfile because there are no
  dependencies.

## Structure and Boundaries

- `src/db/client.js` — `connect(url)` returns `execute(sql, args)` and
  `transaction(work)`. `execute` opens a server stream, runs one statement,
  and closes it. `transaction` keeps one stream open by sending back the baton
  from each response, runs `BEGIN IMMEDIATE`, calls `work(tx)`, then `COMMIT`,
  or `ROLLBACK` and rethrow when `work` throws. Connection failures raise
  `DatabaseError`.
- `src/invoices/repository.js` — invoice SQL (`insertInvoice`, `listInvoices`,
  `toInvoice`).
- `src/invoices/service.js` — `parseInvoice` validation and `recordInvoice`.
- `migrations/` with `scripts/migrate.js` — numbered SQL files applied in
  file-name order, each in its own transaction, tracked in `schema_migrations`.
- `test/support/fake-db.js` — `fakeDb(results)`, the stand-in database used by
  unit tests.

## Commands

- `npm test` — unit tests (`node --test test/*.test.js`); no database needed.
- `npm run test:db` — database tests in `test/db/` (`node --test test/db/*.test.js`)
  against the libSQL server at `LIBSQL_URL` (default `http://127.0.0.1:8080`).
  They apply pending migrations first and clear the invoices table.
- `npm run db:migrate` — applies pending migrations to `LIBSQL_URL`.

## Conventions and Constraints

- SQL lives in repository modules; services take the database, or the
  transaction handle passed to `work`, as their first argument.
- Statements that must succeed or fail together run inside
  `db.transaction(work)` using the `tx` it passes.
- Schema changes are new numbered files in `migrations/`; applied migrations
  are never edited.

## External Systems and Data

- libSQL server (`sqld`). `README.md` shows how to start one locally; no
  repository script, container file, or CI configuration starts one.
- `invoices (id, customer, amount_cents, issued_on)` with a CHECK that
  `amount_cents > 0`.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`.
- Unit tests (`test/invoices.test.js`) use `fakeDb`: its `execute` records
  each statement and returns queued results, and its `transaction(work)` calls
  `work` and records `begin`, then `commit` or `rollback`. It does not execute
  SQL or hold data.
- `test/db/invoices.db.test.js` covers storing and listing invoices and the
  amount CHECK constraint against a real server.

## Known Unknowns

- Whether a libSQL server is available where workflow roles run. The database
  suite was not run during this audit.

## Evidence

- `package.json`, `README.md`, `src/`, `migrations/`, `scripts/`, and `test/`
  at `${COMMIT:Add invoice recording with validation}`.
- `npm test` in the project root at that commit: exit 0, 6 tests passed.
