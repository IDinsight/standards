# Project Context

## Project Baseline

- `notes` is a small in-memory notes library (version 0.3.0) with a plain-text
  export. There is no persistence, CLI, or network code.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/notes.js` — store creation and note operations (`createStore`,
  `createNote`, `listNotes`, `deleteNote`). The store is a plain object
  `{ notes, nextId }`; callers receive shallow copies of notes.
- `src/format.js` — plain-text export (`formatNote`, `formatNotes`).
- `test/` — `node:test` suites for both modules.

## Commands

- `npm test` — runs `node --test test/notes.test.js test/format.test.js` from
  the project root.

## Conventions and Constraints

- Named exports only; small functions; errors are thrown as `Error` with a
  short lowercase message (`title is required`).
- `listNotes` and `createNote` return copies so callers cannot mutate stored
  notes.

## Testing and Verification Baseline

- Seven tests across `test/notes.test.js` and `test/format.test.js`; all pass
  on the current baseline.

## Relevant Existing Behavior

- Note ids increase from 1 per store and are never reused after deletion.
- `formatNote` renders `# <title>`, then a blank line and the body when the body
  is not empty; `formatNotes` joins notes with a blank line.

## Evidence

- `src/notes.js`, `src/format.js`, `package.json` — structure and commands.
- `npm test` — 7 passing tests on the audited revision.
