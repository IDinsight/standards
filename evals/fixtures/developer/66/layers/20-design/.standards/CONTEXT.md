# Project Context

## Project Baseline

- `invoice-cli` is a small Node.js command (`bin/invoice.js`) that reads an
  order JSON file and prints subtotal, tax, and total lines.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules, no runtime or development
  dependencies.

## Structure and Boundaries

- `src/totals.js` — integer-cent arithmetic; tax rounded to the nearest cent.
- `src/format.js` — cents to `$D.CC` strings.
- `src/cli.js` — `run(argv, { readFile })` returns `{ code, stdout, stderr }`;
  `bin/invoice.js` only wires it to the process.

## Commands

- `npm test` — runs `node --test test/totals.test.js test/cli.test.js`.

## Conventions and Constraints

- Money is integer cents throughout; formatting happens only in output.
- Existing output lines are parsed by downstream scripts and must not change.
- Exit status 1 is used for usage and read errors.

## Testing and Verification Baseline

- `node:test` with a stubbed `readFile`; no test touches the filesystem.

## Evidence

- `src/`, `bin/invoice.js`, `test/`, `package.json`.
