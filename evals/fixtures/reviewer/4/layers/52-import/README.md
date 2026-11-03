# records

Record store for the internal records tool, with a CSV import for record lists
kept in spreadsheets.

## Development

Requires Node 22. There are no dependencies to install.

    npm test

## Layout

- `src/store.js`: in-memory record store
- `src/csv.js`: CSV reader (RFC 4180)
- `src/import.js`: `importRecords(store, csvText)`; the first row must be
  `id,title,owner,status`
- `test/`: `node:test` suites; `test/fixtures/` holds sample CSV files
