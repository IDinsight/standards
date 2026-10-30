# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, a small request/response route layer, and
CSV export of filtered records for administrators. See
[docs/usage.md](docs/usage.md) for how to list, filter, and export records.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test
    pnpm --filter export test:integration

TypeScript runs through Node's type stripping; there is no build step.
Export files are written to `exports/`, which git ignores.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`records.ts` for listing, `export.ts` for
  CSV export)
- `src/export.ts`: CSV serialization and export files
- `src/app.ts`: wires the store and routes together
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` holds the export flow
  checks run by `test:integration`
