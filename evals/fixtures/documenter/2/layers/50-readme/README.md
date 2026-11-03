# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, a small request/response route layer, and a
CSV export of the records list for administrators. See
[docs/usage.md](docs/usage.md) for how to use the service.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test
    pnpm --filter export test:integration

`test:integration` runs the export end to end against the seeded app; it
writes into a temporary folder that it removes afterwards.

TypeScript runs through Node's type stripping; there is no build step.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`records.ts` for listing, `export.ts` for the
  CSV export)
- `src/export.ts`: CSV serialization and writing export files
- `src/app.ts`: wires the store and routes together; export files go to
  `exports/` in the working directory by default (ignored by git)
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` holds the end-to-end export
  test
