# Project Context

## Project Baseline

- `notes-export` is a small Node.js tool that turns a JSON array of notes into
  one Markdown document.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/store.js` — `loadNotes(path)` reads and validates the JSON file, keeping
  only `title` and `body`.
- `src/export.js` — `noteToMarkdown(note)` and `toMarkdown(notes)` define the
  Markdown format.
- `bin/export.js` — command-line entry point; writes the export to stdout.

## Commands

- `npm test` — runs `node --test test/export.test.js test/store.test.js` from
  the project root.

## Conventions and Constraints

- Each note renders as a `## <title>` heading, a blank line, and the trimmed
  body; notes are separated by a blank line.

## Testing and Verification Baseline

- `test/export.test.js` asserts exact export output; `test/store.test.js`
  covers loading and validation. All tests pass at the audited commit.

## Evidence

- `src/export.js`, `src/store.js`, `bin/export.js`, `test/export.test.js`,
  `test/store.test.js`; `npm test` (exit 0).
