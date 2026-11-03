# Project Context

## Project Baseline

- `notes` is a small in-memory note library used by the notes service.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/store.js` — in-memory store; returns copies of notes.
- `src/notes.js` — `addNote` (validation, title trim, tag normalization) and
  `listNotes` (archive filter, newest-first sort).
- `test/notes.test.js` — node:test suite for the module.

## Commands

- `npm test` — runs `node --test test/notes.test.js`.

## Conventions and Constraints

- Tags are stored trimmed and lowercased; empty tags are dropped on create.
- `listNotes` hides archived notes unless `includeArchived` is true and sorts by
  `updatedAt` descending.

## Testing and Verification Baseline

- Three tests cover archive filtering and sorting, title and tag normalization,
  and empty-title rejection. All pass.

## Evidence

- `src/notes.js`, `test/notes.test.js`, `npm test` (exit 0, 3 passes).
