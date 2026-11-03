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

## Authentication

The service runs only behind the company access gateway. The gateway signs
users in through single sign-on, drops any `x-gateway-*` headers sent by the
client, and forwards the signed-in user in plain request headers:
`x-gateway-user-id`, `x-gateway-user`, and `x-gateway-role`. The HTTP host
that serves this package builds each `AppRequest` and sets `user` to
`userFromGateway(headers)` from `src/auth/gateway.ts`. The service trusts
those headers and does not authenticate users itself; each route handler then
checks the role with `authorize`.

## Layout

- `src/records/`: record store and query filters
- `src/auth/`: roles, `userFromGateway`, and the `authorize` helper; every
  route handler checks roles server-side with it
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers (`GET /records`, `POST /records/export`)
- `src/export.ts`: CSV serialization and export file writing
- `src/app.ts`: wires the store and routes together
- `packages/seed/`: seed records (workspace package `@records/seed`)
- `test/`: `node:test` suites; `test/integration/` drives the export end to end
- `exports/`: export files written by the service (ignored by git)
