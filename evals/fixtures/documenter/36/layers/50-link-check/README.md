# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
from `@records/seed`, role checks, and a small request/response route layer.
See [docs/usage.md](docs/usage.md) for how to list and filter records.

## Development

Requires Node 22 and pnpm.

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

## Documentation

User-facing documentation lives in `docs/`. Check its links before a
documentation change goes to review:

    sh scripts/check-links.sh

The check runs [lychee](https://lychee.cli.rs/) over `README.md` and
`docs/*.md` with the settings in `lychee.toml`. It validates relative links and
heading anchors and every published `http(s)` link the docs contain. A
documentation change is ready for review only when that run, including the
published links, has passed; a local-only result does not count. lychee is a
standalone binary and is not part of the pnpm workspace, so install it on your
machine first.
