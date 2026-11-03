# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, and a small request/response route layer.
See [docs/usage.md](docs/usage.md) for how to list and filter records.

## Getting started

Requires Node 22. Dependencies are installed with pnpm 10: the lockfile and the
`workspace:*` link to `@records/seed` need pnpm, and npm cannot install them.
Node 22 ships Corepack, which provides pnpm:

    corepack enable
    corepack prepare pnpm@10 --activate

Then, from a fresh checkout, install the dependencies and run the tests:

    pnpm install
    pnpm --filter export test

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
