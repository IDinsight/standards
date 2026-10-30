# Project Context

## Project Baseline

- `iniparse` is a small dependency-free INI parser with a command-line wrapper
  that prints a parsed file as JSON.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies and no build step.

## Structure and Boundaries

- `src/parser.js` — `parse(text)` and `ParseError`; all parsing rules live
  here.
- `src/cli.js` — `ini2json <file>`: reads a file, prints JSON, exits 1 on a
  `ParseError` and 2 without an argument.
- `test/parser.test.js` — `node:test` suite for `parse`.

## Commands

- `npm test` (runs `node --test test/parser.test.js`) — the parser tests; it
  writes no files.

## Conventions and Constraints

- `parse` returns `{ section: { key: value } }` with string values. Keys before
  the first header go under `''`, which is dropped when empty.
- Errors are `ParseError` with message `line N: <reason>` and a numeric `line`.
- Values are the trimmed text after the first `=`; there is no quoting or
  inline-comment handling.

## Testing and Verification Baseline

- Four tests cover sections, top-level keys, comments, and the missing `=`
  error; all pass.

## Evidence

- `src/parser.js`, `src/cli.js`, `test/parser.test.js`, `package.json`.
- `node --test test/parser.test.js` in the project root at the initial commit:
  exit 0, 4 passed.
