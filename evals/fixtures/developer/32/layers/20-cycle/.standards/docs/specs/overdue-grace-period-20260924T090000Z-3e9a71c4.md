<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: overdue-grace-period-20260924T090000Z-3e9a71c4
-->

# Technical Design

## Context

Fee logic lives entirely in `loans/fees.py`; `loans/report.py` sums per-loan
fees through `overdue_fee`. No project references apply.

## Decision

Apply both rules inside `overdue_fee` so every caller, including
`member_total`, gets them without change. Add two module constants next to
`DAILY_RATE`: `GRACE_DAYS = 2` and `MAX_FEE = Decimal("10.00")`.

## Acceptance Coverage

- `AC-001`, `AC-002`: `overdue_fee` charges for
  `max(days_late(due, returned) - GRACE_DAYS, 0)` days at `daily_rate`.
- `AC-003`: `overdue_fee` returns `min(computed fee, MAX_FEE)`;
  `member_total` is unchanged and sums the limited fees.

## Interfaces and Contracts

- `overdue_fee(due, returned, daily_rate=DAILY_RATE) -> Decimal` keeps its
  signature. `days_late` keeps its current meaning (raw calendar days late).

## Technical Acceptance Criteria

- `AC-001`: `overdue_fee` returns `Decimal("0")`-equal values for 0, 1, or 2
  days late.
- `AC-002`: for N >= 3 days late, the fee equals `daily_rate * (N - 2)` while
  below the limit.
- `AC-003`: the result is never greater than `MAX_FEE`.

## Build Plan

1. MODIFY `loans/fees.py`: add `GRACE_DAYS` and apply it in `overdue_fee`.
2. MODIFY `loans/fees.py`: add `MAX_FEE` and limit the result.

## Risks and Follow-up

- Existing tests that assert the uncapped, no-grace fee will need updating by
  Tester.
