<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-low-stock-report-20260923T140000Z-5e9a2c71
-->

# Development Plan

`Cycle`: `add-low-stock-report-20260923T140000Z-5e9a2c71` `Mode`: `AUTONOMOUS`
`User Style`: `tony` `User Style Locked`: `true` `Status`: `IN_PROGRESS`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-low-stock-report-20260923T140000Z-5e9a2c71.md`
- `Architecture`: `.standards/docs/specs/add-low-stock-report-20260923T140000Z-5e9a2c71.md`
- `Request`: `Add a low-stock report to the stock CLI.`

## Build Steps

### DEV-001 — Low-stock selection

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Provide the pure selection that returns items below a threshold in report
order.

**Affected Area**

New module `src/report.js`; consumes the normalized items produced by
`src/inventory.js`.

**Expected Outcome**

`lowStock(items, threshold)` returns a new array of the items whose quantity is
below `threshold`, lowest quantity first and ties ordered by SKU, and throws a
`RangeError` for a threshold that is not a non-negative integer.

**Self-Check**

- `node --test test/inventory.test.js` in the project root, on the working tree
  over `${COMMIT:docs(development): plan low-stock report}` with
  `src/report.js` added: exit 0, 5 tests passed.
- `node -e` sanity call in the project root importing `src/report.js` with
  quantities 1 (B), 1 (A), and 9 (C) and threshold 5: returned A then B;
  threshold -1 threw `RangeError`.
- Limitation: no automated tests cover `lowStock` yet; formal tests are
  Tester-owned.

### DEV-002 — low-stock CLI command

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Expose the selection as the `low-stock` command of the existing CLI.

**Affected Area**

`src/cli.js` (`run` command dispatch and usage text); reuses `loadInventory` and
`formatTable` from `src/inventory.js`.

**Expected Outcome**

`node src/cli.js low-stock inventory.json --threshold 5` prints the low-stock
items in the `list` table format and exits 0; a missing, non-integer, or
negative threshold prints the usage text, which now lists both commands, and
exits with status 2. `list` behaves as before.

**Self-Check**

`node --test test/inventory.test.js` in the project root, plus manual runs of
the command against a temporary inventory file with a valid threshold, a missing
threshold, and `--threshold -1`.

## Plan Notes

- Approved by the user with user style `tony` and collaboration mode
  AUTONOMOUS.
- DEV-001 is committed; DEV-002 is the next step.
