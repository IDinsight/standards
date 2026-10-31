<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: archive-retention-20260924T090000Z-5c81e2a7
-->

# Development Plan

`Cycle`: `archive-retention-20260924T090000Z-5c81e2a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/archive-retention-20260924T090000Z-5c81e2a7.md`
- `Architecture`: `.standards/docs/specs/archive-retention-20260924T090000Z-5c81e2a7.md`
- `Request`: `Configurable archive retention window, a dry-run option, and an operator guide; the user selected IMPLEMENTATION_REVIEWED completion.`

## Build Steps

### DEV-001 — Configurable retention window

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Cleanup uses `ARCHIVE_RETENTION_DAYS` (default 30) and refuses invalid values
before touching any file.

**Affected Area**

`src/config.js`, `src/cleanup.js`, `bin/cleanup.js`.

**Expected Outcome**

`parseRetentionDays` and `loadCleanupConfig` follow the design's contract;
`runCleanup` takes `retentionDays` and applies `isExpired`; `loadConfig` and the
export command are unchanged.

**Self-Check**

- `npm test` in the project root at
  `${COMMIT:Add configurable archive retention and dry run}`: exit 0, 5 tests
  passed, 0 failed. This is the existing suite; the fixed-30-day test still
  passes through the default window.
- `ARCHIVE_RETENTION_DAYS=0 node bin/cleanup.js` and
  `ARCHIVE_RETENTION_DAYS=abc node bin/cleanup.js` in the project root at the
  same commit: both exit 1 and print the `ARCHIVE_RETENTION_DAYS must be ...`
  message; the archive directory is not read.

### DEV-002 — Dry run and summary wording

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Operators can preview a cleanup with `--dry-run`.

**Affected Area**

`src/cleanup.js`, `bin/cleanup.js`.

**Expected Outcome**

`runCleanup({ dryRun: true })` returns the same removal list without unlinking;
the command prints the dry-run summary and one indented line per file; the
real-run summary is unchanged; other arguments exit 2 with usage.

**Self-Check**

- In a temporary directory holding `export-old.csv` (touched 40 days ago) and
  `export-new.csv`, `ARCHIVE_DIR=<that directory> node bin/cleanup.js --dry-run`
  in the project root at
  `${COMMIT:Add configurable archive retention and dry run}`: exit 0, printed
  `archive cleanup: scanned 2, would remove 1, kept 1` and `  export-old.csv`;
  both files remained. The same command without `--dry-run` printed
  `archive cleanup: scanned 2, removed 1, kept 1` and deleted `export-old.csv`.
- `node bin/cleanup.js --force`: exit 2 with the usage line.

## Plan Notes

- AC-002 (the operations guide at `docs/operations/archive-cleanup.md`) has no
  implementation step: the design gives it no architectural impact and it is
  Documenter-owned.
- Plan approved by the user before implementation; no user style selected.
- Project references loaded: `NONE`.
