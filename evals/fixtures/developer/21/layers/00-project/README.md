# admin-console

Admin record storage and request handlers for the internal console.

- `src/records.js` — record creation, updates, and response shape
- `src/store.js` — in-memory record store with JSON file persistence
- `src/api.js` — handlers returning `[status, body]`

Run the tests with `npm test` (Node 22, no dependencies).
