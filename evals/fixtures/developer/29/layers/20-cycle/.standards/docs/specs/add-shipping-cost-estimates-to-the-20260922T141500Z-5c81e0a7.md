<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-shipping-cost-estimates-to-the-20260922T141500Z-5c81e0a7
-->

# Technical Design

## Context

The tool already maps destinations to zones (`parcels/zones.py`) and carries the 2026 rate card as `Decimal` values in `parcels/rates.py`, but nothing computes a price. Project instructions require money as `decimal.Decimal`.

## Decision

Compute each parcel's price in `parcels/rates.py` from the existing rate card, round once per parcel, and sum the rounded per-parcel prices per destination in `summarize()`. Keep every amount a `Decimal` from the rate card to the printed report; the half-up rule in AC-001 differs from what the built-in `round()` and binary floats produce.

## Acceptance Coverage

- `AC-001`: `billable_kg()` and `parcel_cost()` in `parcels/rates.py` (see Interfaces and Contracts).
- `AC-002`: `cost_eur` entry added by `summarize()` in `parcels/summary.py`.
- `AC-003`: `cost_eur` column in `parcels/cli.py`.

## Components

- `parcels/rates.py` — owns billable weight and the per-parcel price.
- `parcels/summary.py` — aggregates prices per destination; does no rounding of its own.
- `parcels/cli.py` — presentation only.

## Interfaces and Contracts

- `billable_kg(weight_grams: int) -> int`: weight rounded up to whole kilograms, minimum 1.
- `parcel_cost(parcel: Parcel) -> Decimal`: `(base + per_kg * billable_kg) * (1 + FUEL_SURCHARGE)`, quantized to `Decimal("0.01")` with `ROUND_HALF_UP`. Example: destination `ES`, 1500 g, gives `15.53`.
- `summarize()` adds a `cost_eur` entry to each destination: the `Decimal` sum of `parcel_cost()` over that destination's parcels. Existing keys and the sorted order are unchanged.
- Report: a `cost_eur` column after `weight_kg`, right-aligned, two decimals, formatted from the `Decimal` without converting it to `float`.
- `UnknownDestination` keeps propagating unchanged.

## Data and Control Flow

CSV row -> `Parcel` -> `zone_for()` -> rate card -> `parcel_cost()` -> per-destination sum in `summarize()` -> report row.

## Technical Acceptance Criteria

- `AC-001`: `parcel_cost()` returns a `Decimal` with exactly two decimal places; halves round up.
- `AC-002`: `cost_eur` equals the sum of the rounded per-parcel prices; no `float` appears in the computation.
- `AC-003`: The header gains `cost_eur` as its last column and each row prints the destination total with two decimals.

## Build Plan

1. Per-parcel price in `rates.py`.
2. Destination totals in `summarize()`.
3. Report column.

## Risks and Follow-up

- The rate card is hard-coded for 2026; loading a 2027 card is later work.
