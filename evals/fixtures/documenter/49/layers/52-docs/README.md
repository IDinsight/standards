# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, a small request/response route layer, and a
CSV export for administrators. See [docs/usage.md](docs/usage.md) for how to
list, filter, and export records.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test
    pnpm --filter export test:integration

TypeScript runs through Node's type stripping; there is no build step. The
last command runs the end-to-end export tests in `test/integration/`; they
write export files into a temporary folder and remove it afterwards.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`records.ts` lists records, `export.ts`
  exports them)
- `src/export.ts`: CSV serialization and export file writing
- `src/app.ts`: wires the store and routes together; `createApp` options set
  the export folder (`exportDir`) and the clock (`now`)
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` holds the end-to-end export
  tests
- `exports/`: export files written at runtime by default (ignored by git)
