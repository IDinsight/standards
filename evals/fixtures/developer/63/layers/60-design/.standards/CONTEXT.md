# Project Context

## Project Baseline

- `slugkit` is a small published ES module library with one export,
  `slugify(text)`, in `src/slug.js`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/slug.js` — the whole public API.
- `test/slug.test.js` — `node:test` suite for current behavior.

## Commands

- `npm test` — runs `node --test test/slug.test.js` from the project root.

## Conventions and Constraints

- The package has no dependencies and should stay that way.
- Output for existing calls is relied on by downstream users (stored URLs), so
  it must not change.

## Testing and Verification Baseline

- Three tests cover lowercasing and joining, accent stripping, and punctuation
  collapse with hyphen trimming. No length-related behavior is tested.

## Relevant Existing Behavior

- `slugify` NFKD-normalizes the text, strips combining marks, lowercases,
  replaces every run of characters outside `a-z0-9` with one hyphen, and trims
  leading and trailing hyphens.

## Evidence

- `src/slug.js`, `test/slug.test.js`, `package.json`, `README.md`.
