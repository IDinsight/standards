<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: archive-retention-20260924T090000Z-5c81e2a7
-->

# Technical Design

## Context

Cleanup lives in `src/cleanup.js` (`runCleanup`, `formatSummary`) with a fixed
30-day window; `bin/cleanup.js` reads `ARCHIVE_DIR` through `loadConfig` in
`src/config.js`, which `bin/export.js` also uses. Project context is in
`.standards/CONTEXT.md`. No project references apply.

## Decision

Parse the window in `src/config.js` with a new `parseRetentionDays` and a
cleanup-specific `loadCleanupConfig`, leaving `loadConfig` unchanged so the
export command is unaffected by a bad retention value. `runCleanup` takes the
window and a `dryRun` flag; `formatSummary` adds dry-run wording without
changing the real-run line. The command accepts one flag, `--dry-run`.

## Acceptance Coverage

- `AC-001`: `parseRetentionDays` and `loadCleanupConfig`, and the expiry rule
  in `isExpired`, used by `runCleanup`.
- `AC-002`: No architectural impact — satisfied by Documenter's saved guide at
  `docs/operations/archive-cleanup.md`, which must describe the contracts in
  **Interfaces and Contracts**.
- `AC-003`: `runCleanup({ dryRun: true })`, the `--dry-run` flag, and the
  dry-run summary format.

## Components

- `src/config.js` — parses and validates the window.
- `src/cleanup.js` — decides expiry, deletes or reports, builds the summary.
- `bin/cleanup.js` — argument handling, output, and exit codes.

## Interfaces and Contracts

- `ARCHIVE_RETENTION_DAYS`: unset or empty means 30. Otherwise it must match
  `^\d+$` and be at least 1; anything else makes `loadCleanupConfig` throw an
  `Error` whose message starts with `ARCHIVE_RETENTION_DAYS`. The command prints
  the message to stderr and exits 1 before reading the archive directory.
- Expiry: a regular file is expired when `mtimeMs < now - days * 86400000`. A
  file exactly at the boundary is kept. Directories and other entries are
  skipped and not counted.
- `runCleanup({ archiveDir, retentionDays = 30, now = Date.now(), dryRun = false })`
  returns `{ scanned, removed, kept, dryRun }`; `removed` is the sorted list of
  expired names, deleted unless `dryRun` is true.
- Summary line: real run `archive cleanup: scanned S, removed R, kept K`
  (unchanged); dry run `archive cleanup: scanned S, would remove R, kept K`,
  followed by one indented line per file name.
- Command: `node bin/cleanup.js [--dry-run]`; any other argument prints usage
  and exits 2.

## Technical Acceptance Criteria

- `AC-001`: unset, empty, and valid values parse as above; `0`, negative,
  fractional, and non-numeric values throw before `runCleanup` is called.
- `AC-001`: the expiry rule above, with the boundary file kept.
- `AC-003`: with `dryRun` true, no file is unlinked and `removed` equals what a
  real run with the same inputs would remove.
- `AC-003`: dry-run summary and file list as above; the real-run line is
  unchanged.

## Build Plan

1. MODIFY `src/config.js`: add `DEFAULT_RETENTION_DAYS`, `parseRetentionDays`,
   and `loadCleanupConfig`.
2. MODIFY `src/cleanup.js`: `isExpired`, window and `dryRun` options, summary
   wording.
3. MODIFY `bin/cleanup.js`: use `loadCleanupConfig`, add `--dry-run` and the
   argument check.

## Risks and Follow-up

- A very large window keeps every file; this is accepted.
