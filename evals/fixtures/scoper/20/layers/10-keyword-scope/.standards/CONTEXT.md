# Project Context

## Project Baseline

- `catalog-search` searches the publications catalog. `search(records, query)`
  in `src/search.js` matches the query against record titles only, with
  case-sensitive substring matching.

## Stack and Tooling

- Node.js 22, plain ES modules, no dependencies. Tests use `node:test`.

## Structure and Boundaries

- `src/catalog.js` — record shape and sample records.
- `src/search.js` — search entry point.
- `test/search.test.js` — search tests.
- `docs/product/search.md` — project-owned product description of search.

## Commands

- `npm test` — runs `node --test test/search.test.js`.

## Testing and Verification Baseline

- One test covers title matching. It passes.
