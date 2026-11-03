<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: contact-import-20260915T140000Z-5e6f7a8b
-->

# Technical Design

## Context

`loadDirectory` in `src/directory.js` adds parsed rows without checks. There is
no way to write a directory back to disk.

## Decision

Validate inside `loadDirectory` and throw `Error` with messages of the form
`<path>: <problem>`. Add `saveDirectory(directory, path)` in the same module,
writing `list()` as indented JSON through a temporary file that is renamed into
place.

## Acceptance Coverage

- `AC-001`: `loadDirectory` checks `Array.isArray` on the parsed value before
  reading rows.
- `AC-002`: per-row checks for `id`, `name`, and repeated `id`, with the 1-based
  row number in the message.
- `AC-003`: `loadDirectory` trims and lowercases string `email` values before
  `add`.
- `AC-004`: `saveDirectory` writes `directory.list()` as a JSON array in name
  order, readable by `loadDirectory`.
- `AC-005`: No architectural impact; Documenter owns the README.

## Interfaces and Contracts

- `loadDirectory(path) -> Promise<Directory>`; rejects with
  `<path>: expected a JSON array of contacts` or `<path>: row N ...`.
- `saveDirectory(directory, path) -> Promise<void>`; writes `<path>.tmp`, then
  renames it to `path`.

## Technical Acceptance Criteria

- `AC-002`: the first invalid row stops loading; no directory is returned.
- `AC-004`: output order equals `Directory#list()` order.

## Build Plan

1. Input validation and email normalization in `loadDirectory`.
2. `saveDirectory` with the temporary-file write.
