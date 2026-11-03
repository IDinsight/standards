# Project Context

## Project Baseline

- `orders` is a small Node.js command-line tool that reads an order CSV export
  and prints a summary of it. Pre-cycle baseline: the `summary` command only.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies; `npm` only runs scripts.

## Structure and Boundaries

- `src/orders.js` — CSV reading (`loadOrders`, `parseOrders`), amount parsing
  to integer cents (`toCents`), and `summarize`.
- `src/format.js` — `formatCents` renders integer cents with two decimals.
- `bin/orders.js` — CLI entry point; dispatches subcommands and prints usage.
- `test/` — `node:test` suites; `test/data/orders.csv` is the shared sample
  export.

## Commands

- `npm test` — runs `node --test test/orders.test.js test/cli.test.js` from the
  project root.
- `node bin/orders.js summary <file>` — prints `Orders: <count>` and
  `Total: <amount>`.

## Conventions and Constraints

- Money is kept in integer cents and formatted only for output.
- Input CSV: header `id,customer,amount,date`, comma separated, no quoted
  fields; amounts use a dot and at most two decimals.
- No third-party packages.

## Testing and Verification Baseline

- `test/orders.test.js` covers `toCents`, `parseOrders`, `summarize`, and
  `formatCents`; `test/cli.test.js` runs the CLI with `execFileSync` and
  `spawnSync` for `summary` output and the usage exit status.

## Relevant Existing Behavior

- An unknown command or a missing file argument prints a usage line to stderr
  and exits with status 2.

## Active-Cycle Non-Baseline Work

- `Cycle: customer-totals-report-20260922T141500Z-3e8b1f5a; src/totals.js and the totals command in bin/orders.js (${COMMIT:Add customer totals report command})`
  — written on this cycle's earlier expedited path; tentative, not established
  baseline. No tests cover it yet.

## Evidence

- `package.json`, `bin/orders.js`, `src/`, and `test/` at
  ${COMMIT:Promote customer totals cycle to standard}.
- `npm test` in the project root at that commit: exit 0, 6 tests passed.
