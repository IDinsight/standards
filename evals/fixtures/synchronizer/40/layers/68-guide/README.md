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

TypeScript runs through Node's type stripping; there is no build step. The
integration tests write export files to a temporary folder and remove it
afterwards.

`pnpm --filter export test:e2e` checks export access end to end through the
admin tool's dev stack, which serves this package behind its gateway. Start
the stack from the admin-tool repository first, and set `RECORDS_E2E_URL` and
`RECORDS_E2E_EXPORT_DIR` when it does not use the defaults in
`test/e2e/export-access.test.ts`.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`GET /records`, `POST /records/export`)
- `src/export.ts`: CSV serialization and export file writing
- `src/app.ts`: wires the store and routes together
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` drives the export in-process,
  and `test/e2e/` runs against the admin tool's dev stack
- `exports/`: export files written by the service (ignored by git)
