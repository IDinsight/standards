# Project Context

## Project Baseline

- `envfile` is a small library that reads dotenv-style configuration text into
  a plain object of string values.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/parser.js` — `parse(text)` and `ParseError`; all format rules live here.
- `src/index.js` — public entry point; re-exports `parse` and `ParseError` and
  adds `load(path)`, which reads a UTF-8 file and parses it.
- `test/parser.test.js` — `node:test` tests for the format rules.

## Commands

- `npm test` — runs `node --test test/parser.test.js`.

## Conventions and Constraints

- Errors are `ParseError` with a 1-based `line` property and a message
  prefixed `line N:`.
- Values are always strings; the parser does no type conversion.

## Testing and Verification Baseline

- Five tests cover comments, blank lines, the `export` prefix, inline
  comments, key override, and the missing-`=` error. All pass at the audited
  revision.

## Relevant Existing Behavior

- Unquoted values are trimmed and end at a `#` preceded by whitespace.
- Quote characters have no special meaning: `A="x"` yields the value `"x"`
  including the quotes.

## Evidence

- `src/parser.js`, `src/index.js`, `README.md` — current format rules.
- `npm test` — 5 passing tests.
