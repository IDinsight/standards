# Project Context

## Project Baseline

- `records-export` is the CSV export library used by the records admin
  backend. It renders records read through a `RecordSource` as CSV.
- `buildCsv(source)` in `src/export.ts` reads every record with one
  `source.page(0, source.count())` call, renders every row, and returns the
  whole file as one string, so its memory use grows with the number of
  records exported.

## Stack and Tooling

- Node 22 runs the TypeScript sources directly through type stripping; there
  is no build step. Imports use explicit `.ts` specifiers.
- TypeScript is used only for type checking: `tsconfig.json` (strict,
  `noEmit`, `allowImportingTsExtensions`) with `typescript` and `@types/node`
  as dev dependencies, installed with `npm install`. There are no runtime
  dependencies.

## Structure and Boundaries

- `src/records.ts` — `RecordItem`, the `RecordSource` interface (`count()`,
  `page(offset, limit)` in ascending id order), and `MemorySource`, which
  holds records in memory.
- `src/csv.ts` — `COLUMNS`, `CSV_HEADER`, `csvCell` (RFC 4180 quoting), and
  `csvRow` (one CRLF-terminated row).
- `src/export.ts` — `buildCsv`.

## Commands

- `npm test` — runs `node --test test/csv.test.ts test/export.test.ts` from
  the project root.
- `npm run typecheck` — `tsc --noEmit`; requires `npm install` first.

## Conventions and Constraints

- CSV output: header `id,title,owner,status,createdAt`, one row per record in
  ascending id order, CRLF after every row, RFC 4180 quoting.
- Modules use only Node built-ins.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`. `test/csv.test.ts` covers quoting
  and row rendering; `test/export.test.ts` covers `buildCsv` ordering and the
  empty case.
- No memory or performance measurement exists in the repository.

## Relevant Existing Behavior

- The CSV content `buildCsv` produces is relied on by the admin backend and
  must stay the same.

## Evidence

- `package.json`, `tsconfig.json`, `src/`, `test/`, and `README.md` at
  `${COMMIT:Add whole-file CSV export}`, inspected.
