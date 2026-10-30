<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-shipping-cost-estimates-to-the-20260922T141500Z-5c81e0a7
-->

# Development Plan

`Cycle`: `add-shipping-cost-estimates-to-the-20260922T141500Z-5c81e0a7` `Mode`: `AUTONOMOUS`
`User Style`: `tony` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-shipping-cost-estimates-to-the-20260922T141500Z-5c81e0a7.md`
- `Architecture`: `.standards/docs/specs/add-shipping-cost-estimates-to-the-20260922T141500Z-5c81e0a7.md`
- `Request`: `Add shipping cost estimates to the parcel summary.`

## Build Steps

### DEV-001 — Per-parcel price from the rate card

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Add billable weight and per-parcel price functions on top of the existing rate card.

**Affected Area**

`parcels/rates.py`.

**Expected Outcome**

`billable_kg()` and `parcel_cost()` exist with the contract in the design; prices are `Decimal` values quantized to the cent with halves rounded up.

**Self-Check**

Planned: `python3 -m pytest -q` from the repository root, plus a direct call of `parcel_cost()` against the design example.

### DEV-002 — Destination totals in the summary

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Report the total price per destination from `summarize()`.

**Affected Area**

`parcels/summary.py`.

**Expected Outcome**

Each destination entry gains `cost_eur`, the sum of `parcel_cost()` over its parcels; existing keys and ordering are unchanged.

**Self-Check**

Planned: `python3 -m pytest -q` from the repository root, plus a sanity call on a small parcel list comparing `cost_eur` with the sum of the per-parcel prices.

### DEV-003 — Cost column in the report

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-003`

**Goal**

Show each destination's total in the printed report.

**Affected Area**

`parcels/cli.py`.

**Expected Outcome**

The report header ends with `cost_eur` and each row prints the destination total with two decimals.

**Self-Check**

Planned: `python3 -m pytest -q` from the repository root, plus `python3 -m parcels.cli` on a small sample CSV.

## Plan Notes

- Approved by the user as proposed, including `User Style` `tony`.
