# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, and a small request/response route layer.
See [docs/usage.md](docs/usage.md) for how to list and filter records.

## Development

Requires Node 22.

    npm install
    npm test

TypeScript runs through Node's type stripping; there is no build step.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers
- `src/app.ts`: wires the store and routes together
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites
