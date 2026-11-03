# Project Context

## Project Baseline

- `bytesize` is a small dependency-free ES module with two byte-size helpers.
  It has a short README and no user guide; the active cycle is
  documentation-only.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no runtime or dev
  dependencies.

## Structure and Boundaries

- `src/bytes.js` — exports `formatBytes(bytes, { digits })` and
  `parseBytes(text)`; the only source module.
- `test/bytes.test.js` — `node:test` suite covering both helpers, including
  error cases.
- `scripts/check-links.mjs` — checks that relative Markdown links in
  `README.md` and `docs/*.md` resolve to existing files.
- `README.md` — project summary and commands.

## Commands

- `npm test` — runs `node --test test/bytes.test.js`.
- `npm run check:links` — runs `node scripts/check-links.mjs`; exits 1 and
  lists broken links when a relative link does not resolve.

## Conventions and Constraints

- Output strings of `formatBytes` and accepted labels of `parseBytes` are
  defined by `src/bytes.js`; the test suite is the closest existing record of
  representative values.

## Testing and Verification Baseline

- `npm test` passes on the current tree. No documentation build or example
  runner exists.

## Relevant Existing Behavior

- `formatBytes` shows counts below the first multiple as whole bytes and
  larger counts with a fixed number of decimals (default 1).
- `formatBytes` throws `RangeError` for negative or non-finite input;
  `parseBytes` throws `SyntaxError` for unparseable text or unknown units.

## Evidence

- `src/bytes.js`, `test/bytes.test.js`, `scripts/check-links.mjs`,
  `package.json` — read during the audit.
- `npm test` in the project root — 6 tests passed.
