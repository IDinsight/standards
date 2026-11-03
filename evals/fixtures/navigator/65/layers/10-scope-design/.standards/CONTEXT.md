# Project Context

## Project Baseline

- Small in-memory book catalog used by the library kiosk. No server, database,
  or external dependencies.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no npm
  dependencies.

## Structure and Boundaries

- `src/catalog.js` — the book list (`listBooks`, `getBook`); returns copies so
  callers cannot mutate the catalog.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test test/catalog.test.js test/search.test.js`.

## Testing and Verification Baseline

- `test/catalog.test.js` covers `listBooks` copying and `getBook` lookups.
- `test/search.test.js` is a skipped placeholder.

## Evidence

- `src/catalog.js`, `test/catalog.test.js`, `package.json`.
