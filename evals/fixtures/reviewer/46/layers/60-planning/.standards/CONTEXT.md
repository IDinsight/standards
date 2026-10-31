# Project Context

## Project Baseline

- `archive-export` is a small Node service that writes the nightly CSV export
  into an archive directory (`bin/export.js`) and prunes old archive files
  (`bin/cleanup.js`). Cleanup removes regular files last modified more than a
  fixed 30 days ago.

## Stack and Tooling

- Node 22, plain JavaScript ES modules, no dependencies. Tests use `node:test`.

## Structure and Boundaries

- `src/config.js` — environment configuration (`loadConfig`, `ARCHIVE_DIR`),
  shared by both commands.
- `src/cleanup.js` — `runCleanup` and `formatSummary`.
- `src/export.js` — CSV formatting and archive file naming.
- `bin/` — command-line entry points.
- `docs/operations/` — operator guides.

## Nearest Analogues

- `docs/operations/export-worker.md` — the existing operator guide: a
  configuration table, how to run the command by hand, its output, and
  troubleshooting.
- `loadConfig` in `src/config.js` — environment reading with defaults.

## Commands

- `npm test` — runs `node --test test/cleanup.test.js test/config.test.js test/export.test.js`.
- `node bin/cleanup.js` — runs cleanup against `ARCHIVE_DIR`.

## Conventions and Constraints

- Cleanup only acts on regular files directly inside the archive directory.
- The summary line `archive cleanup: scanned S, removed R, kept K` is read by
  the operations log alerting; its wording must not change for real runs.

## Testing and Verification Baseline

- Five tests across `test/cleanup.test.js`, `test/config.test.js`, and
  `test/export.test.js`. Cleanup tests build temporary archive directories and
  set file ages with `utimes`.

## Relevant Existing Behavior

- `runCleanup` returns `{ scanned, removed, kept }` with `removed` sorted.
- The cleanup command prints one summary line and exits 1 with the error
  message on failure.

## Evidence

- `src/cleanup.js`, `src/config.js`, `bin/cleanup.js` — cleanup behavior.
- `docs/operations/export-worker.md` — operator guide conventions.
- `npm test` in the project root — exit 0, 5 tests passed.
