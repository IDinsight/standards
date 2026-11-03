<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-low-stock-alerts-and-a-restock-20260924T083000Z-3e9a7c51
-->

# Development Plan

`Cycle`: `add-low-stock-alerts-and-a-restock-20260924T083000Z-3e9a7c51` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-low-stock-alerts-and-a-restock-20260924T083000Z-3e9a7c51.md`
- `Architecture`: `.standards/docs/specs/add-low-stock-alerts-and-a-restock-20260924T083000Z-3e9a7c51.md`
- `Request`: `Add low-stock alerts and a restock report for purchasing.`

## Build Steps

### DEV-001 — Low-stock detection

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Add `lowStock(items)` so callers can get the items that have reached their
reorder level.

**Affected Area**

New module `src/alerts.js`; it consumes the item objects returned by
`loadItems` in `src/inventory.js` and does not change that module.

**Expected Outcome**

`lowStock(items)` returns a new array of the items with `reorderLevel > 0` and
`quantity <= reorderLevel`, sorted by `sku` with plain string comparison,
without modifying the input.

**Self-Check**

Run from the project root on commit `${COMMIT:Add low-stock detection}` with a
clean working tree, Node 22:

- `node --test test/inventory.test.js`: exit 0; 3 tests passed, 0 failed.
  Existing inventory behavior is unchanged.
- `node --input-type=module -e "import { lowStock } from './src/alerts.js'; const items = [{ sku: 'B2', name: 'Bolt', quantity: 4, reorderLevel: 5 }, { sku: 'A1', name: 'Axle', quantity: 5, reorderLevel: 5 }, { sku: 'C3', name: 'Cap', quantity: 0, reorderLevel: 0 }, { sku: 'D4', name: 'Disc', quantity: 9, reorderLevel: 5 }]; console.log(lowStock(items).map((item) => item.sku).join(','));"`:
  exit 0; printed `A1,B2`. The items at (A1) and below (B2) their reorder level
  are returned in SKU order; C3 (reorder level 0) and D4 (above its level) are
  not. The input array was left in its original order.
- Limitation: these are Developer sanity checks; no automated test exercises
  `lowStock` yet.

**Implementation Notes**

Sorting uses `<` and `>` string comparison as the design specifies, rather than
`localeCompare`, so ordering does not depend on the runtime locale. `filter`
returns a new array before `sort`, so the input is never reordered.

### DEV-002 — Restock report CSV

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Add `restockReport(items)` that turns the low-stock list into the CSV
purchasing receives.

**Affected Area**

New module `src/report.js`, built on `lowStock` from `src/alerts.js`.

**Expected Outcome**

`restockReport(items)` returns the header `sku,name,quantity,order_quantity`
followed by one line per low-stock item in SKU order, with `order_quantity`
equal to `2 * reorderLevel - quantity`, RFC 4180 quoting for fields that
contain a comma, double quote, or newline, and a trailing newline.

**Self-Check**

Planned: `node --test test/inventory.test.js` from the project root, plus a
sanity call of `restockReport` covering the header, order quantities, an empty
low-stock list, and a name containing a comma.

## Plan Notes

The user approved this plan as proposed, with AUTONOMOUS mode and no user style.
Implementation paused after DEV-001; resume with DEV-002.
