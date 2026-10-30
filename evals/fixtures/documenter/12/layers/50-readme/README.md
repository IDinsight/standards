# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, and a small request/response route layer.
Administrators can export the filtered records list as a CSV file, which the
service also keeps in its export folder.
See [docs/usage.md](docs/usage.md) for how to list and filter records.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test
    pnpm --filter export test:integration

`test` runs the unit and route suites; `test:integration` runs the end-to-end
export tests, which write their files to a temporary folder.

TypeScript runs through Node's type stripping; there is no build step.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`GET /records`, `POST /records/export`)
- `src/export.ts`: CSV serialization and export file writing
- `src/app.ts`: wires the store and routes together; `createApp` takes the
  export folder as `exportDir` (default `exports`)
- `exports/`: export files written by the service, created on the first export
  relative to the working directory and ignored by git
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` holds the export flow tests
