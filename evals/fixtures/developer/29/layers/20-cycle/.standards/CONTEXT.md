# Project Context

## Project Baseline

- `parcels` summarizes a CSV export of outgoing parcels by destination country for the operations team.

## Stack and Tooling

- Python 3.11, standard library only; pytest for tests.

## Structure and Boundaries

- `parcels/models.py` — `Parcel` dataclass (`parcel_id`, `destination`, `weight_grams`).
- `parcels/zones.py` — destination country to shipping zone (`A`, `B`, `C`); `UnknownDestination` for unmapped codes.
- `parcels/rates.py` — the published 2026 rate card (`RATES`, `FUEL_SURCHARGE`) as `Decimal` values; nothing computes a price yet.
- `parcels/summary.py` — `summarize()` groups parcels by normalized destination code.
- `parcels/cli.py` — reads the CSV and prints a fixed-width report.

## Commands

- `python3 -m pytest` — run all tests from the repository root.
- `python3 -m parcels.cli <file.csv>` — print the report for an export.

## Conventions and Constraints

- `AGENTS.md`: black formatting (line length 100, double quotes); money as `decimal.Decimal`, never `float`.
- Destination codes are trimmed and upper-cased before lookup.

## Testing and Verification Baseline

- `tests/test_zones.py`, `tests/test_summary.py`, `tests/test_cli.py`; 7 tests, all passing.

## Relevant Existing Behavior

- `summarize()` returns destinations in sorted order with `zone`, `parcels`, and `weight_grams` keys; the report prints `destination`, `zone`, `parcels`, `weight_kg`.
- An unmapped destination raises `UnknownDestination` from both the summary and the report.

## Evidence

- `python3 -m pytest` at `${COMMIT:Add command-line report}` — 7 passed.
- `parcels/rates.py`, `AGENTS.md`, `pyproject.toml` — rate card, conventions, formatter settings.
