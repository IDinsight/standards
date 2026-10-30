# Project Context

## Project Baseline

- `records` is the record store for the internal records tool: an in-memory
  `RecordStore` and a CSV import that adds records from spreadsheet files.
  There is no HTTP layer in this repository; callers use the modules directly.
- There is no export feature and no CSV writing code.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies,
  no build step, no linter.

## Structure and Boundaries

- `src/store.js` — `RecordStore` with `add` (rejects a duplicate id), `get`,
  and `list(filter)`: exact `status` and `owner` filters, copies ordered by
  id; `STATUSES` (`active`, `archived`).
- `src/csv.js` — `parseCsv(text)`: RFC 4180 reader; quoted fields may contain
  commas, doubled double quotes, and line breaks; rows end with CRLF or LF.
  Its only caller is the import.
- `src/import.js` — `importRecords(store, text)`: header
  `id,title,owner,status`; checks every row (field count, whole-number id,
  known status) before adding any; errors name the row (`row N: ...`);
  returns the number added.
- `test/fixtures/records.csv` — sample import file with CRLF rows, shared by
  the reader and import tests. Record 1's title has a comma, record 3's has
  double quotes, and record 4's has a line break inside quotes.

## Commands

- `npm test` — runs `node --test` over the test files listed in
  `package.json`, from the project root; no network needed.

## Conventions and Constraints

- Test files are listed explicitly in the `test` script.
- Import files come from spreadsheet programs and use CRLF row endings.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`: `test/store.test.js`,
  `test/csv.test.js`, `test/import.test.js`.

## Relevant Existing Behavior

- The import's file format, validation, and error messages must keep working
  as they do.

## Evidence

- `package.json`, `src/`, and `test/` at `${COMMIT:Add CSV import of records}`.
- `npm test` in the project root at that commit: exit 0, 11 tests passed.
