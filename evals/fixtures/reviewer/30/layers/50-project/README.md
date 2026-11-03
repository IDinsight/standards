# ledger

Invoice ledger service for finance. Invoices are stored in a libSQL server
(`sqld`) and reached through its HTTP API with the small client in
`src/db/client.js`, so the service has no npm dependencies.

## Development

Requires Node 22.

    npm test              # unit tests; no database needed
    npm run db:migrate    # apply migrations/ to the database at LIBSQL_URL
    npm run test:db       # database tests; needs a running libSQL server

`LIBSQL_URL` defaults to `http://127.0.0.1:8080`. To run a server locally:

    sqld --db-path .data/ledger.db --http-listen-addr 127.0.0.1:8080

The database tests apply the migrations and clear the invoices table, so point
them at a scratch database.

## Layout

- `src/db/client.js`: libSQL HTTP client (`execute`, `transaction`)
- `src/invoices/`: invoice records
- `migrations/`: SQL migrations, applied in file-name order by `scripts/migrate.js`
- `test/`: unit tests, using the stand-in database in `test/support/fake-db.js`
- `test/db/`: tests against a libSQL server
