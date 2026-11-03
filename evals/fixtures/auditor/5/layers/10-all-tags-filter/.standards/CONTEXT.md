# Project Context

## Project Baseline

- `taglist` is a small JavaScript library for tagging notes and filtering notes
  by tag. It has no CLI, server, or persistence; consumers import
  `src/index.js`.

## Stack and Tooling

- Node.js 20: `.nvmrc` is `20`, and `package.json` declares `engines.node`
  `>=20`.
- Plain ES modules (`"type": "module"`). No runtime or development
  dependencies, no lockfile, and no build or transpile step.

## Structure and Boundaries

- `src/index.js` — public entry point; re-exports every public function.
- `src/tags.js` — `normalizeTag` and the set helpers `union`, `intersection`,
  and `difference`, written by hand over `Set`s.
- `src/notes.js` — note creation (`createNote`) and the tag filters; builds on
  the helpers in `src/tags.js`.
- `test/` — one `node:test` file per source module (`test/tags.test.js`,
  `test/notes.test.js`).
- `.github/workflows/ci.yml` — CI for pushes to `main` and for pull requests.

## Commands

- `npm test` — runs `node --test test/tags.test.js test/notes.test.js`. This is
  the only test command; there is no lint or build script.

## Conventions and Constraints

- No third-party dependencies; Node built-ins only (README, Development).
- Every public function is re-exported from `src/index.js` and listed in the
  README API section.
- Functions are pure: they return new values and do not mutate their
  arguments.
- Tags are compared only after `normalizeTag` (trim, then lowercase).

## Testing and Verification Baseline

- Tests use `node:test` with `node:assert/strict`.
- Test files are named explicitly in the `test` script in `package.json`, so a
  new test file runs only once it is added there.
- CI runs `npm test` on the Node version read from `.nvmrc`.

## Relevant Existing Behavior

- `createNote(id, text, tags)` stores a note's tags as a `Set` of normalized
  strings.
- `union`, `intersection`, and `difference` return new `Set`s and leave their
  arguments unchanged; the filters in `src/notes.js` match tags with them.
- The existing filters normalize the query tags and return matching notes in
  input order.

## Evidence

- `package.json`, `.nvmrc` — runtime, module type, and scripts.
- `.github/workflows/ci.yml` — CI command and runtime source.
- `README.md` — dependency policy, API list, and test instructions.
- `src/`, `test/` — module boundaries and existing behavior.
- `npm test` (project root) — exit 0, 7 tests passed.
