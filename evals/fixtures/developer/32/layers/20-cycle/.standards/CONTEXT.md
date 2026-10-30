# Project Context

## Project Baseline

- `loans` is a small Python package that computes overdue fees for library
  loans and a member's total fees.

## Stack and Tooling

- Python 3.11+, standard library only (`datetime`, `decimal`). pytest for
  tests, configured in `pyproject.toml` (`testpaths`, `pythonpath`).

## Structure and Boundaries

- `loans/fees.py` — `DAILY_RATE`, `days_late(due, returned)`, and
  `overdue_fee(due, returned, daily_rate=DAILY_RATE)`.
- `loans/report.py` — `member_total(loans)` sums `overdue_fee` over
  `(due, returned)` pairs.
- `tests/` — pytest tests for both modules.

## Commands

- `python3 -m pytest` — run all tests from the project root.

## Conventions and Constraints

- Money is `Decimal`, never `float`.
- Dates are `datetime.date`; days late counts calendar days, and early or
  on-time returns count as 0.

## Testing and Verification Baseline

- `tests/test_fees.py` covers `days_late` and the daily-rate fee;
  `tests/test_report.py` covers `member_total`. All pass at the time of this
  audit.

## Relevant Existing Behavior

- `overdue_fee` charges `DAILY_RATE` for every day late, with no grace period
  and no upper limit.

## Evidence

- `loans/fees.py`, `loans/report.py`, `tests/` — module behavior.
- `python3 -m pytest` — baseline suite passes.
