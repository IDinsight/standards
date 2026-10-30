# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, CSV export of records, and a small
request/response route layer. See [docs/usage.md](docs/usage.md) for how to
list, filter, and export records.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test
    pnpm --filter export test:integration

TypeScript runs through Node's type stripping; there is no build step.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`GET /records`, `POST /records/export`)
- `src/export.ts`: CSV serialization and export files
- `src/app.ts`: wires the store and routes together; `exportDir` sets the
  export folder
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` runs the export end to end
- `exports/`: export files written at run time (ignored by git)
