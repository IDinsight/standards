# Project Context

## Project Baseline

- `stockroom` is a small in-process inventory library: a product catalog with a
  TTL read cache and a CSV product importer. There is no HTTP server, CLI, or
  persistent storage.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"` in
  `package.json`). No runtime or development dependencies and no lockfile.
- Tests use the built-in `node:test` runner with `node:assert/strict`.

## Structure and Boundaries

- `src/cache.js` — `TtlCache`: an in-memory `Map` with per-entry expiry
  (`ttlMs`, default 60 000 ms) and an injectable clock (`now`). Methods: `get`,
  `set`, `delete`, `clear`.
- `src/catalog.js` — `Catalog`: owns the product map; caches `get(sku)` under
  `product:<sku>` and `list()` under `list:all`.
- `src/importer.js` — `parseProducts(text)` parses product text;
  `importProducts(catalog, text)` upserts the valid rows into a `Catalog`.
- `test/` — one test file per module.

## Commands

- `npm test` — runs `node --test test/cache.test.js test/catalog.test.js
  test/importer.test.js` (test files are listed explicitly in the script).

## Conventions and Constraints

- Modules stay dependency-free.
- Cache keys are plain strings shaped `<kind>:<id>`.

## Relevant Existing Behavior

- `Catalog.upsert` deletes only `product:<sku>` from the cache; a cached
  `list:all` is served until its TTL expires.
- `parseProducts` requires the header columns `sku`, `name`, and `quantity`
  (exact lowercase names) and throws `missing column: <name>` otherwise. Rows
  are split on commas, cells are trimmed, and blank lines are ignored.
- A row with an empty SKU, or a quantity that is not a non-negative integer, is
  counted in `skipped` and not imported; no per-row detail is kept.
- `importProducts` returns `{ imported, skipped }`.

## Testing and Verification Baseline

- `test/cache.test.js`, `test/catalog.test.js`, `test/importer.test.js`; all
  pass with `npm test` on this revision.

## Evidence

- `package.json`, `src/*.js`, `test/*.test.js`, `README.md`.
- `npm test` — exit 0, 9 tests passed.
