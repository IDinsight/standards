# Project Context

## Project Baseline

- `records-admin` backs the internal records admin tool: an in-memory
  `RecordStore` seeded from `src/seed.ts`, server-side role checks, and routes
  exercised in-process through `createApp().handle(request)` (no HTTP
  listener).
- Routes: `GET /records` (every signed-in role; `status` and `owner` filters)
  and `POST /records/import` (admins and editors; CSV body). There is no
  export.

## Stack and Tooling

- Node 22 runs the TypeScript sources by type stripping; no build step,
  typechecker, linter, or dependencies.

## Structure and Boundaries

- `src/store.ts` — `RecordStore` (`list` by exact `status` and `owner`,
  ordered by id; `add`) and `parseFilter` (400 for an unknown status).
- `src/parse-csv.ts` — `parseCsv`: RFC 4180 reading (quoted fields, doubled
  quotes, line breaks inside quotes, LF, CRLF, or CR row endings).
- `src/csv.ts` — `escapeCell` and `formatRow`: a value containing a comma or
  a double quote is quoted with its quotes doubled; line breaks are not
  quoted. Their only caller is the import rejection report.
- `src/import.ts` — `importRecords`: header `title,owner,status,createdAt`;
  valid rows are added; invalid rows are listed in a rejection report written
  with `formatRow` (header `row,reason,title,owner,status,createdAt`, LF row
  endings).
- `src/auth.ts` — `authorize` (401 without a user, 403 for a role not
  allowed) and `requireAdmin`, unused so far. `src/http.ts` — `HttpError`,
  request/response types, `json`, `Router`. `src/app.ts` — routes.

## Commands

- `pnpm test` — runs `node --test test/*.test.ts` in the project root;
  offline.

## Conventions and Constraints

- Handlers check roles with `authorize` first. Errors are JSON with an
  `error` message.
- Editors load records from spreadsheets with bulk import and read the
  rejection report in the admin tool.

## Testing and Verification Baseline

- `node:test` suites: `test/store.test.ts`, `test/routes.test.ts`
  (`GET /records`), `test/csv.test.ts` (`parseCsv`, `escapeCell`),
  `test/import.test.ts` (import, rejection report contents and read-back
  through `parseCsv`, import authorization).
- Seed record 1's title contains a comma; record 3's contains double quotes.

## Evidence

- `src/`, `test/`, and `package.json` at
  `${COMMIT:Set up records service with bulk CSV import}`; `pnpm test` there:
  exit 0, 11 tests passed.
