# Project Context

## Project Baseline

- `catalog` is a private Node.js package holding the storefront's in-memory
  product catalog and the HTML for the catalog list page. Items carry `id`,
  `name`, `category`, `priceCents`, and `stock`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use the built-in `node:test` runner and `node:assert/strict`.

## Structure and Boundaries

- `src/cache.js` — `Cache`, a TTL key/value cache with an injectable clock.
- `src/catalog.js` — `createCatalog(items, options)` with `get`, `list`, and
  `update`, read through one `Cache` instance keyed `item:<id>` and
  `list:<category or *>`.
- `src/ui/listPage.js` — `renderListPage(items, { title })` returns the list
  page as an HTML string; `escapeHtml` escapes item text.
- `test/` — one test file per module.

## Commands

- `npm test` — runs `node --test` on the files listed in `package.json`; a new
  test file must be added to that list to run.

## Conventions and Constraints

- No external dependencies; modules import each other with relative `.js`
  specifiers.
- All item text rendered into HTML goes through `escapeHtml`.

## Testing and Verification Baseline

- `test/cache.test.js`, `test/catalog.test.js`, and `test/render.test.js`; all
  pass at the audited revision.

## Relevant Existing Behavior

- `update(id, changes)` removes only the cached `item:<id>` entry. Cached
  `list:*` results keep returning pre-update data until their TTL (60 seconds
  by default) expires.
- `get` and `list` return copies of stored items; callers cannot change the
  catalog's stored items through them.
- The list page renders name and price only; `stock` is not displayed.

## Evidence

- `package.json` — module type and test command.
- `src/catalog.js`, `src/cache.js` — cache keys and invalidation.
- `src/ui/listPage.js`, `test/render.test.js` — page markup and escaping.
