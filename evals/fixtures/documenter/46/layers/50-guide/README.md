# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, and a small request/response route layer.
See [docs/usage.md](docs/usage.md) for how to list, filter, and export records.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test
    pnpm --filter export test:integration

TypeScript runs through Node's type stripping; there is no build step. The
integration tests write export files to a temporary folder and remove it
afterwards.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`records.ts` lists records, `export.ts`
  exports them as CSV)
- `src/export.ts`: CSV serialization and export files
- `src/app.ts`: wires the store and routes together; its `exportDir` option
  sets the export folder (default `exports/`, ignored by git)
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` runs the export end to end
