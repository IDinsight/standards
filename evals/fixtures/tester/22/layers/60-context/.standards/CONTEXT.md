# Project Context

## Project Baseline

- `records-export` is a small TypeScript library the records admin service
  uses to turn the records a user has filtered into a CSV download.
- `toCsv` always separates fields with commas; there is no delimiter option.

## Stack and Tooling

- Node 22 runs the TypeScript sources through native type stripping: no build
  step, no `tsconfig`, no typechecker, no linter. Imports use explicit `.ts`
  specifiers.
- No runtime or development dependencies; `package.json` has only a `test`
  script.

## Structure and Boundaries

- `src/export.ts` — `COLUMNS`, `csvCell(value)`, `toCsv(records)`, and
  `exportFileName(now)`. Pure functions; nothing is written to disk here.
- `src/records.ts` — `RecordItem` and `RecordStatus` types.
- `src/index.ts` — package entry point; re-exports everything in
  `src/export.ts` and the record types.

## Commands

- `npm test` — runs `node --test test/*.test.ts` from the project root; works
  offline.

## Conventions and Constraints

- CSV output: header row `id,title,owner,status,createdAt`, rows in the order
  given, CRLF after every row including the last, RFC 4180 quoting (a field
  containing a comma, double quote, CR, or LF is enclosed in double quotes
  with embedded quotes doubled).
- The README's API section documents this output format for callers in the
  admin service.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` under `test/`. `test/export.test.ts`
  holds twelve scenarios: `csvCell` (plain, numeric, empty, comma, embedded
  quotes, line breaks, non-ASCII, surrounding spaces), `toCsv` (header and
  CRLF rows, empty list, fixed column order), and `exportFileName`.

## Evidence

- `package.json`, `src/`, `test/`, and `README.md` at
  `${COMMIT:Add export file names and more serializer tests}`.
- `npm test` in the project root at that commit: exit 0, 12 tests passed.
