# catalog

In-memory product catalog with a read cache and CSV import.

- `src/store.js` — `ProductStore` (`get`, `put`, `remove`, `list`), backed by a
  `Map` with an LRU read cache (`src/cache.js`).
- `src/import.js` — `parseCsv(text)` and `importCsv(store, text)` for product
  files with `sku`, `name`, and `price` columns.

Run the tests with `npm test`.
