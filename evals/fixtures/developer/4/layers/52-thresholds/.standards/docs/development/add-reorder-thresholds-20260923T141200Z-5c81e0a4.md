<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-reorder-thresholds-20260923T141200Z-5c81e0a4
-->

# Development Plan

`Cycle`: `add-reorder-thresholds-20260923T141200Z-5c81e0a4` `Mode`: `CODE_WITH_ME`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-reorder-thresholds-20260923T141200Z-5c81e0a4.md`
- `Architecture`: `.standards/docs/specs/add-reorder-thresholds-20260923T141200Z-5c81e0a4.md`
- `Request`: `Add per-item reorder thresholds and a low-stock report.`

## Build Steps

### DEV-001 — Optional reorder threshold on items with validation

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002`

**Goal**

Items can carry an optional reorder threshold, set when added or later, and
negative values are rejected before the item changes.

**Affected Area**

`inventory/models.py` (`Item`), `inventory/store.py` (`add`, new
`set_threshold`, shared validation helper).

**Expected Outcome**

`Item.reorder_threshold` defaults to `None`; `add(..., reorder_threshold=...)`
and `set_threshold(sku, threshold)` store it; a negative value raises
`ValueError` and leaves the existing threshold in place. Existing callers are
unaffected.

**Self-Check**

- `python3 -m pytest -q` in the project root, on the working tree with this
  step's changes to `inventory/models.py` and `inventory/store.py`: exit 0,
  5 passed.
- `python3 -c` sanity check in the project root: added `A-1` with quantity 3
  and threshold 5, then `set_threshold` with -1 raised `ValueError` and the
  threshold stayed 5; `set_threshold` with `None` cleared it. Result as
  expected.
- Limitation: no automated tests cover thresholds yet; formal coverage is
  Tester's.

**Implementation Notes**

The user wrote the `reorder_threshold` field and the `add` parameter;
Developer reviewed it and, at the user's request, added the module-level
`_check_threshold` helper so `add` and `set_threshold` validate the same way
before mutating.

### DEV-002 — Low-stock report

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-003, AC-004`

**Goal**

Provide `low_stock(store)` listing the items that have reached their reorder
threshold.

**Affected Area**

`inventory/report.py`, beside `stock_summary`.

**Expected Outcome**

`low_stock(store)` returns the list of dicts defined in the design's
Interfaces and Contracts: items with a threshold whose quantity is at or below
it, ordered by SKU; items without a threshold are excluded; the store is not
modified.

**Self-Check**

Planned: `python3 -m pytest -q` from the project root (existing tests still
pass), plus a `python3 -c` sanity check with items below, at, and above their
thresholds, one with threshold 0, and one without a threshold.

## Plan Notes

- Approved by the user in Code With Me mode: the user writes the code and asks
  Developer to explain, review, or take over specific parts.
