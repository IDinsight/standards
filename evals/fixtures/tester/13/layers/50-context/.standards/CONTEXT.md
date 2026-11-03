# Project Context

## Project Baseline

- `records-platform` is the records service's data layer as a pnpm
  workspace: `packages/export` (package `export`) lists records from
  PostgreSQL with filters and exports them as CSV files; `packages/db`
  (`@records/db`) is the in-repository PostgreSQL client it uses.
- `exportRecords(db, filter, outputPath)` in `packages/export/src/export.js`
  loads every matching record with `listRecords` and writes the CSV with one
  `writeFile` call. Exports are not recorded anywhere.

## Stack and Tooling

- Node 22, plain JavaScript ES modules, `node:test`. No registry
  dependencies; `packages/export` depends on `@records/db` through
  `workspace:*`. `pnpm-lock.yaml` is committed and `node_modules` is ignored.
- PostgreSQL 16 for local development and integration tests, started from
  `docker-compose.yml` (service `db`, user `records`, database
  `records_test`, trust authentication, port 5432 on 127.0.0.1).

## Structure and Boundaries

- `packages/db/index.js` — `connect(url)`, `Client.query(sql)` (simple query
  protocol; rows as objects of text values or null; a server error rejects
  with `DatabaseError` and leaves the connection usable), `Client.end()`,
  and `literal(value)` for SQL literals. Trust, cleartext, and md5
  authentication; no SCRAM. One query at a time per client; no parameter
  binding and no transaction helpers.
- `packages/export/src/records.js` — `filterClause`, `selectRecordsSql`,
  `toRecord`, `listRecords`. Filters: exact `status` (`active` or
  `archived`, otherwise `RangeError`), exact `owner`, case-insensitive title
  text `q` with LIKE wildcards escaped; ordered by `id`; `createdAt` as ISO
  8601 UTC.
- `packages/export/src/csv.js` — `COLUMNS`, `HEADER`, `csvCell`, `csvLine`,
  `recordLine`: RFC 4180 quoting, CRLF line endings.
- `packages/export/src/export.js` — `exportRecords`.
- `packages/export/src/config.js` — `databaseUrl()`: `DATABASE_URL` or
  `postgres://records@127.0.0.1:5432/records_test`.
- `db/schema.sql` — the `records` table.

## Commands

- `pnpm --filter export test` — unit tests (`test/unit/*.test.js`) with
  in-memory fake clients; no database needed.
- `pnpm --filter export test:integration` — integration tests
  (`test/integration/*.test.js`) against the database at `DATABASE_URL`;
  each test drops and recreates the tables from `db/schema.sql` and loads six
  seed records. Requires a running PostgreSQL, for example
  `docker compose up -d db` from the repository root (README).
- `pnpm --filter @records/db test` — client protocol tests against an
  in-process stand-in server; no database needed.

## Conventions and Constraints

- SQL is built as text with `literal()` for every value.
- Callers own the client connection and pass it in; library functions do not
  open or close connections.

## External Systems and Data

- PostgreSQL `records` table: `id`, `title`, `owner`, `status`,
  `created_at` (`timestamptz`). Seed titles in the integration helper include
  a comma (record 1) and double quotes (record 3).

## Testing and Verification Baseline

- Unit: `test/unit/csv.test.js`, `test/unit/records.test.js`,
  `test/unit/export.test.js` (fake client returning canned rows).
- Integration: `test/integration/records.test.js` (`listRecords` ordering
  and filters) using `test/integration/helpers.js` (`withDatabase`).
- No CI configuration in the repository.

## Relevant Existing Behavior

- The CSV format (header, column order, quoting, CRLF) and the listing
  filters and their validation.

## Evidence

- Root and package `package.json` files, `packages/*/src`, `packages/*/test`,
  `db/schema.sql`, `docker-compose.yml`, and `README.md` at
  `${COMMIT:Document local database setup for integration tests}`.
- `pnpm --filter export test` in the project root at that commit: exit 0,
  10 tests passed.
- `pnpm --filter @records/db test` at that commit: exit 0, 3 tests passed.
