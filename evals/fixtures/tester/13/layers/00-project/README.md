# records-platform

Data layer for the records service, as a pnpm workspace:

- `packages/db` (`@records/db`): a small PostgreSQL client, kept in the
  repository so the workspace has no registry dependencies.
- `packages/export` (`export`): record listing with filters, and CSV export.

## Development

Requires Node 22 and pnpm.

    pnpm install
    pnpm --filter export test
    pnpm --filter @records/db test

Both test commands run without a database.
