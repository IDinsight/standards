# Project Context

## Project Baseline

- `records-transfer` keeps records (`id`, `title`, `owner`) in an in-memory
  `RecordStore` and moves them in and out as CSV: `importRecords` reads CSV
  from a file path or readable stream; `exportRecords` writes CSV to a file
  path or writable stream.
- Neither direction has a time limit today. A destination that stops
  accepting data leaves `exportRecords` pending indefinitely.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies,
  no build step, no linter.

## Structure and Boundaries

- `src/store.js` — `RecordStore`: `add` validates positive integer ids
  (numeric strings accepted), `list` returns copies ordered by id.
- `src/csv.js` — `COLUMNS`, `formatCell`/`formatRow` (RFC 4180 quoting, CRLF
  row endings), `parseCsv` (header row, CRLF or LF, blank lines skipped).
- `src/io/transfer.js` — `transfer(source, destination)`, a thin wrapper over
  `pipeline` from `node:stream/promises`. It is the one stream boundary shared
  by import and export: an error on either side rejects and destroys both
  streams.
- `src/import.js` — `importRecords(source, store)`: file path or readable
  stream into a collecting writable, parsed in `final`.
- `src/export.js` — `exportRecords(store, destination)`: `Readable.from` a CSV
  line generator into a file write stream or the given writable.

## Commands

- `npm test` — runs `node --test` on `test/csv.test.js`,
  `test/import.test.js`, and `test/export.test.js` from the project root;
  works offline.

## Conventions and Constraints

- All file and stream I/O goes through `transfer`.
- Public functions accept either a file path or a stream.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`. CSV helpers, import (stream, file
  path, invalid id), and export (stream, file path, round trip) are covered.
  Tests write only to temporary folders.

## Relevant Existing Behavior

- Export output: header `id,title,owner`, rows in id order, CRLF after every
  row, RFC 4180 quoting. An exported file imports back unchanged.
- Import resolves with the number of rows and rejects on an invalid id.

## Evidence

- `package.json`, `src/`, `test/`, and `README.md` at
  `${COMMIT:Add CSV import and export over a shared transfer helper}`.
- `npm test` in the project root at that commit: exit 0, 10 tests passed.
