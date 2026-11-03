<!-- STANDARDS
Artifact: SCOPE
Cycle: postgres-upgrade-20260924T090000Z-0b7d3f62
-->

# PostgreSQL Major Version Upgrade

## Goal

ledger-api runs on PostgreSQL 14 in local development, CI, and production.
PostgreSQL 14 reaches end of life in November 2026, after which it receives no
further fixes. Move all three environments to a supported PostgreSQL major
version without losing developers' local data and with a recoverable production
cutover.

## Constraints

- Production stays on Amazon RDS for PostgreSQL.
- A planned write outage of up to 30 minutes is acceptable for the production
  upgrade, in a maintenance window announced in advance.
- A rollback is needed only until the upgraded production database is verified,
  before writes resume. Problems found after writes resume are fixed forward, so
  no rollback has to keep entries written after the cutover.

## Non-goals

- Changes to the API's routes, responses, or data model.
- Moving production to a different hosting provider or database engine.

## Work

### 1. Supported PostgreSQL in every environment

**Intent:** Keep the service on a PostgreSQL major version that still receives
fixes, in every environment it runs in.

**Done when:**

- `AC-001`: Local development, CI, and production run a supported PostgreSQL
  major version.

**Depends on:** None

### 2. Local data survives the change

**Intent:** Developers should not lose the data in their local databases.

**Done when:**

- `AC-002`: Developers keep their local data through the change.

**Depends on:** 1

### 3. Recoverable production upgrade

**Intent:** The production cutover must be recoverable if the upgraded database
cannot be verified.

**Done when:**

- `AC-003`: The production upgrade has a tested rollback path.

**Depends on:** 1

## Assumptions

- A team member with AWS access carries out the production steps the work
  defines, including confirming which upgrade targets RDS offers for the
  production database.
