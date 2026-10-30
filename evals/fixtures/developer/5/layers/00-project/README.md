# reports

Small service for writing and reading reports. Each report belongs to the
user who created it, and only that user can read it.

- `src/store.js` keeps reports in a JSON file (or in memory when no file is given).
- `src/api.js` holds the request handlers; each returns `{ status, body }`.
- `src/router.js` maps a method and path to a handler.

Run the tests with `npm test`.
