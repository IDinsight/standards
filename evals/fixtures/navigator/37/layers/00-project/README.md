# stockfile

Parses warehouse stock snapshots stored as JSON Lines: one record per line
with `sku` (string), `qty` (non-negative integer), and an optional
`location`. Blank lines and lines starting with `#` are ignored.

## Layout

- `src/records.js`: `parseRecords(text)` and `totalQuantity(records)`.
- `tools/count-records.mjs`: record-count diagnostic. Parses the given file
  and prints `count=N`; exits 1 with the offending line on a parse error.
- `samples/records.jsonl`: small example snapshot.
- `test/records.test.js`: parser tests.

## Commands

- `pnpm test`: run the parser tests.
- `node tools/count-records.mjs <file>` (or `pnpm run count-records <file>`):
  count the records in a snapshot, for example
  `node tools/count-records.mjs samples/records.jsonl`.
