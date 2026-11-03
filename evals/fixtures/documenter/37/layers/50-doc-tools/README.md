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
- `docs/`: guides; `docs/tools/` holds the documentation helpers

## Documentation

Guides live in `docs/`. Two helpers, run from the project root:

    node docs/tools/check-links.mjs

checks every relative link and `#anchor` in `README.md` and `docs/`.

    node docs/tools/preview.mjs

uploads `README.md` and `docs/` to the shared docs preview service, which
renders them with the docs portal theme, and prints the preview URL. Set
`DOCS_PREVIEW_URL` to use a different preview service.
