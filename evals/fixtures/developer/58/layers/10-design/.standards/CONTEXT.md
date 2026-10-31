# Project Context

## Project Baseline

- `attendance-tools` is a small Node.js library the programme team uses to
  normalize attendance rows and write CSV. It has no UI or HTTP layer.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/records.js` — `parseRecords(rows)` turns sheet rows into
  `{ date, site, participant, present, notes }` records; dates are ISO
  `YYYY-MM-DD` strings and site names are trimmed.
- `src/csv.js` — `csvCell` and `csvLine` implement RFC 4180 quoting for commas,
  double quotes, and line breaks.
- `test/` — `node:test` suites.

## Nearest Analogues

- `src/csv.js` and `test/csv.test.js` — the only existing output code: small
  pure functions with one test per rule. The requested export builds on them.

## Commands

- `npm test` — runs `node --test test/*.test.js`.
- `node --test test/csv.test.js` — CSV helper tests only.

## Conventions and Constraints

- Library modules are pure functions with no file or network I/O; callers write
  files.
- Two-space indentation, single quotes, named exports.

## Testing and Verification Baseline

- `test/csv.test.js` covers the quoting rules. There are no tests for
  `src/records.js`.

## Evidence

- `package.json`, `src/csv.js`, `src/records.js`, `test/csv.test.js`.
