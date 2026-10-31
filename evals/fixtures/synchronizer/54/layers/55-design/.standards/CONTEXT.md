# Project Context

## Project Baseline

- `records-export` is a small Node.js ES module that turns arrays of record
  objects into CSV text for the records admin tools. Its single public function
  is `toCsv` in `src/csv.js`.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/csv.js` — `toCsv(rows)` and the private `cell` quoting helper.
- `test/csv.test.js` — `node:test` suite for `toCsv`.

## Commands

- `npm test` (runs `node --test test/csv.test.js`) — the full suite, from the
  project root.

## Conventions and Constraints

- RFC 4180 quoting for fields containing commas, double quotes, or line breaks;
  rows are joined with `\n`.
- Empty input returns an empty string.

## Testing and Verification Baseline

- Three existing tests: default column order, quoting, and empty input. All pass
  at the initial commit.

## Relevant Existing Behavior

- Columns come from the keys of the first row; `null` and `undefined` values are
  written as empty fields.

## Evidence

- `src/csv.js`, `test/csv.test.js`, `package.json`, `README.md`.
