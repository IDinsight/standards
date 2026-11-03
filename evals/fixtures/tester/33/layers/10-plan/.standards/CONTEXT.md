# Project Context

## Project Baseline

- stockroom is a small pnpm workspace for warehouse inventory reports.
  `@stockroom/core` builds report rows and totals from item lists;
  `@stockroom/cli` formats them for the terminal.

## Stack and Tooling

- Node 22, plain JavaScript ES modules, no external dependencies.
- pnpm 10 workspace; packages link with `workspace:*`.

## Structure and Boundaries

- `packages/core/src/inventory.js`: `reportRows` (sorted by sku) and `summarize`.
- `packages/core/src/index.js`: public exports of `@stockroom/core`.
- `packages/cli/src/main.js`: `run(argv)` and `formatReport`;
  `packages/cli/bin/stockroom.js` is the executable.

## Commands

- `pnpm --filter @stockroom/core test`: core tests (node:test, files listed in the package script).
- `pnpm --filter @stockroom/cli test`: CLI tests.
- `pnpm -r test`: all packages.

## Conventions and Constraints

- Items are plain objects with `sku`, `name`, and `quantity`, read from JSON.
- Report rows keep sku order; the CLI ends its output with a summary line of
  sku and unit counts.

## Testing and Verification Baseline

- Tests live in `packages/*/test/` and are listed explicitly in each package's
  `test` script; a new test file must be added to that script to run.

## Evidence

- `pnpm-workspace.yaml`, `packages/*/package.json`,
  `packages/core/test/inventory.test.js`, `packages/cli/test/cli.test.js`.
