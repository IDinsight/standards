# Project Context

## Project Baseline

- `reading-list` is a small Node.js ES module that keeps an in-memory reading
  list for the book club site. It has no persistence and no npm dependencies.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`).

## Structure and Boundaries

- `src/readingList.js` — `createReadingList()` returns an object with
  `add(book)` and `list()`.
- `test/readingList.test.js` — `node:test` suite for the module.

## Commands

- `npm test` — runs `node --test test/readingList.test.js`, the full suite.

## Conventions and Constraints

- `add` trims `title` and `author`, rejects a blank title with `TypeError`, and
  stores tags exactly as given.
- `list()` returns copies of entries so callers cannot change stored state.

## Testing and Verification Baseline

- Three existing tests cover trimming, title validation, and copy-on-read.

## Relevant Existing Behavior

- `list()` takes no arguments today and returns every entry in insertion order.

## Evidence

- `src/readingList.js`, `test/readingList.test.js`, `package.json` — module
  behavior, tests, and the test command.
