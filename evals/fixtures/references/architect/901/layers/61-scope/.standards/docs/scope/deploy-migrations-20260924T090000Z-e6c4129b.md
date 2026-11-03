<!-- STANDARDS
Artifact: SCOPE
Cycle: deploy-migrations-20260924T090000Z-e6c4129b
-->

# Database Migrations in Production Deploys

## Goal

Production deploys of shipments-api must stop depending on someone remembering
to migrate. Today a release that ships a migration starts serving traffic on the
previous schema until the person who deployed it applies the migration by hand,
and a forgotten step leaves new code running against a schema it does not match.
After this change, no release serves traffic before its migrations are applied,
a migration that fails does not take the service down, and CI tests the schema
that production actually gets.

## Constraints

- The service stays on Fly.io, deployed from GitHub Actions on pushes to
  `main`.
- Production's `DATABASE_URL` stays a Fly.io secret; it is not added to the
  repository or to GitHub.
- PostgreSQL 16 and Alembic remain the database and the migration tool.
- The existing migration history in `migrations/versions/` stays as it is.

## Non-goals

- Making the deploy wait for CI to pass.
- Changing, squashing, or reordering existing migrations.
- Staging environments, deploy approvals, or rolling back application
  versions.
- Changes to the shipments API itself.

## Work

### 1. Migrations ship with production deploys

**Intent:** A release and the schema it needs reach production together, so
nobody has to remember a manual step and a new version never serves on an older
schema.

**Done when:**

- `AC-001`: No production deploy lets a new version take traffic before the
  migrations it ships with have been applied.
- `AC-002`: A failed migration stops the deploy, and the running version keeps
  serving.

**Depends on:** None

### 2. CI tests the migrated schema

**Intent:** Tests should exercise the schema production gets from the
migrations, not one generated from the models.

**Done when:**

- `AC-003`: CI runs the tests against the schema the migrations produce.

**Depends on:** None

## Assumptions

- Production is at the newest migration revision today, as
  `docs/operations.md` records.
