<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: summarize-orders-per-currency-apply-20260924T081500Z-5c8e2a91
-->

# Technical Design

## Context

Three modules: `src/parse.js`, `src/summary.js`, `src/cli.js`; see
`.standards/CONTEXT.md`.

## Decision

- Add `currency` and `type` to each parsed order.
- Group in `summarize` by customer and currency; refunds contribute a negative
  amount; ordering lives in `summarize` so every format shares it.
- Add `src/format.js` with one renderer per format; `src/cli.js` selects one
  with `--format`, parsed by `node:util` `parseArgs`.

## Acceptance Coverage

- `AC-001`: `currency` field returned by `parseOrders`.
- `AC-002`: grouping key and row shape of `summarize`.
- `AC-003`: `type` field in `parseOrders`; signed amounts in `summarize`.
- `AC-004`: ordering in `summarize`; renderers in `src/format.js`; `--format` in `src/cli.js`.

## Interfaces and Contracts

- `parseOrders(text)` returns `{ id, customer, currency, type, amount }`;
  errors start with `line N:` (1-based export line).
- `summarize(orders)` returns `{ customer, currency, total }[]`.
- `formatText(rows)`: one line per row, customer, currency, and total with two
  decimals, tab-separated. `formatJson(rows)`: `JSON.stringify(rows, null, 2)`
  plus a newline.
- CLI usage errors print `usage: order-summary [--format text|json] <orders.csv>`
  to stderr and exit 2.

## Technical Acceptance Criteria

- `AC-001`: `currency` is the trimmed, uppercased cell, or `USD` when the column is absent or the cell is empty.
- `AC-002`: one row per distinct customer and currency; `total` rounded to cents.
- `AC-003`: `type` is the lowercased cell, `sale` when absent or empty; other values throw `line N: unknown order type` with the value; refunds are subtracted.
- `AC-004`: rows ordered by customer, then currency (plain string comparison); default or `--format text` writes `formatText`, `--format json` writes `formatJson`; any other format, a missing file argument, or extra arguments print the usage line and exit 2.
