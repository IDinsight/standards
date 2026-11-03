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

## Integration tests

The integration tests in `packages/export/test/integration/` run against a
real PostgreSQL database. Start the local one from the repository root, then
run them:

    docker compose up -d db
    pnpm --filter export test:integration

They connect to `DATABASE_URL`, by default
`postgres://records@127.0.0.1:5432/records_test`, and drop and recreate the
tables from `db/schema.sql` in that database before every test, so never point
them at a database you want to keep.

`@records/db` supports trust, password, and md5 authentication; the compose
service uses trust authentication and listens on 127.0.0.1 only.
