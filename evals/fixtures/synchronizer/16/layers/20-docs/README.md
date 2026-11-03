# records-admin

Backend for the internal records admin tool: an in-memory record store, role
checks, a small request/response route layer, and CSV export of filtered
records for administrators. See [docs/usage.md](docs/usage.md) for how to
list, filter, and export records.

## Development

Requires Node 22. There are no dependencies to install.

    npm test

`npm test` runs the unit suites in `test/` and the end-to-end suites in
`test/integration/`. Tests that export write to a temporary folder and remove
it afterwards.

## Layout

- `src/records/`: record store, seed records, and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response helpers, errors, and the router
- `src/routes/`: route handlers (`GET /records`, `POST /records/export`)
- `src/export.js`: CSV serialization and export file writing
- `src/app.js`: wires the store and routes together
- `test/`: `node:test` suites; `test/integration/` drives the app end to end
- `exports/`: export files written by the service (ignored by git)
