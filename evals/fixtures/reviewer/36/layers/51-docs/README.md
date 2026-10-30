# records-admin

Backend for the internal records admin tool: a tenant-scoped in-memory record
store, role checks, and a small request/response route layer. Each customer
organization is a tenant, and users see only their own tenant's records. See
[docs/usage.md](docs/usage.md) for how to list and filter records.

## Development

Requires Node 22 and pnpm.

    pnpm test

TypeScript runs through Node's type stripping; there is no build step and no
dependencies to install.

## Layout

- `src/records/`: record store, seed records, and query filters
- `src/auth/`: users, roles, and the `authorize` helper; every route handler
  checks roles server-side with it and limits its queries to the user's tenant
- `src/http/`: request/response types, errors, and the router
- `src/routes/`: route handlers
- `src/app.ts`: wires the store and routes together
- `test/`: `node:test` suites
