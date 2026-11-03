# Category report performance: options

`getReport` recomputes every category total from all entries on each call
(`src/report.js`). Ledgers in the 100k-entry range make this noticeably slow.
Two approaches came up in planning.

## Option 1: Cache the computed report

- `getReport` keeps the last report and the time it was built, and rebuilds it
  when it is older than a fixed number of seconds.
- `Ledger` and `categoryReport` stay as they are.

## Option 2: Keep running totals on write

- `Ledger.add` also updates a per-category totals map.
- `categoryReport` reads that map instead of scanning entries.

No decision yet; this is for the design step.
