# Project Context

## Project Baseline

- `notes` is a small Node.js command-line tool that searches a JSON export of a user's notes and keeps named saved searches. This cycle starts from the code committed before STANDARDS was installed.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or development dependencies.
- Tests use `node:test` with `node:assert/strict`.

## Structure and Boundaries

- `bin/notes.js` — CLI entry point: `search`, `saved add|run|list`; reads `.notes/notes.json` and `.notes/saved.json`, or the same files under `$NOTES_DIR`.
- `src/search.js` — `search(notes, query)`; all query handling lives here.
- `src/saved.js` — loads, stores, and runs saved searches; stores the query text and runs it through `search`.
- `README.md` — overview and quick usage.
- `docs/guide.md` — user guide.

## Commands

- `npm test` — runs `node --test test/search.test.js test/saved.test.js`.

## Conventions and Constraints

- Test files are listed explicitly in the `test` script.
- CLI errors print `notes: <message>` to stderr and exit 1; usage errors print the usage text and exit 1.
- `notes` never writes `notes.json`.

## Testing and Verification Baseline

- `test/search.test.js` covers word matching and `tag=` filters; `test/saved.test.js` covers storing and running saved searches.

## Relevant Existing Behavior

- A query is split on whitespace; every word must appear in the title or body, ignoring case, including inside longer words.
- A word of the form `tag=<name>` is a tag filter, compared ignoring case; several filters combine with AND.
- Saved searches are stored as raw query strings in `saved.json` and parsed again on every run.
- Results print as `<id><TAB><title>` in input order.

## Evidence

- `src/search.js`, `src/saved.js`, `bin/notes.js`, `test/`, `package.json`, `README.md`, `docs/guide.md`.
