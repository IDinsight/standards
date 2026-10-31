<!-- STANDARDS
Artifact: SCOPE
Cycle: archive-retention-20260924T090000Z-5c81e2a7
-->

# Configurable Archive Retention

## Goal

Operators need to keep exports for longer or shorter than the fixed 30 days
the cleanup job uses today, check what a cleanup would remove before running
it, and find out how to do both without reading the source.

## Constraints

- With nothing configured, cleanup keeps today's behavior: files older than 30
  days are removed.
- Cleanup only acts on regular files directly inside the archive directory.
- The summary line of a real cleanup keeps its current wording; the operations
  log alerting reads it.

## Non-goals

- Per-file or per-prefix retention rules.
- Changing when cron runs the cleanup job.
- Changes to the export command.

## Work

### 1. Configurable retention window

**Intent:** Let operators set how long archives are kept.

**Done when:**

- `AC-001`: With `ARCHIVE_RETENTION_DAYS` set to a whole number N of 1 or more,
  cleanup removes archive files last modified more than N days ago and keeps
  the rest; when the variable is unset or empty, N is 30. Any other value stops
  cleanup with an error that names the variable, before any file is removed.

**Depends on:** None

### 2. Operations guide

**Intent:** On-call operators can change the window and confirm its effect from
the operations docs alone.

**Done when:**

- `AC-002`: A saved operations guide at `docs/operations/archive-cleanup.md`
  explains how to set `ARCHIVE_RETENTION_DAYS`, how to run a dry run before a
  real cleanup, and how to read the summary line of each.

**Depends on:** 1, 3

### 3. Dry run

**Intent:** Operators can see what a cleanup would remove without losing files.

**Done when:**

- `AC-003`: `node bin/cleanup.js --dry-run` prints a summary and the name of
  each file a real run would remove, and deletes nothing.

**Depends on:** 1
