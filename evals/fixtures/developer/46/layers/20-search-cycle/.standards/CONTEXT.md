# Project Context

## Project Baseline

- `catalog` is a small dependency-free Node.js library: an in-memory catalog
  with id and tag lookup, and CSV export.

## Stack and Tooling

- Node 22, ES modules (`"type": "module"`), no runtime or dev dependencies.

## Structure and Boundaries

- `src/catalog.js` — `createCatalog(items)` normalizes items and returns an
  object with `get`, `all`, and `withTag`.
- `src/export.js` — `toCsv(items)` writes the header `id,title,tags` and one
  row per item, tags joined with `;`.
- `test/` — `node:test` suites for the catalog and the export.

## Commands

- `npm test` — runs `node --test test/catalog.test.js test/export.test.js`
  from the project root.

## Conventions and Constraints

- Plain JavaScript ES modules; no build step.

## Testing and Verification Baseline

- `test/catalog.test.js` covers normalization, tag lookup, and unknown ids;
  `test/export.test.js` covers a plain-value export.

## Relevant Existing Behavior

- Titles are trimmed and tags are trimmed and lowercased when the catalog is
  created; `withTag` matches exact normalized tags.
- `all()` returns items in insertion order.

## Evidence

- `src/catalog.js`, `src/export.js`, `test/`, `package.json`.
