<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: overdue-grace-period-20260924T090000Z-3e9a71c4
-->

# Development Plan

`Cycle`: `overdue-grace-period-20260924T090000Z-3e9a71c4` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `false` `Status`: `PROPOSED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/overdue-grace-period-20260924T090000Z-3e9a71c4.md`
- `Architecture`:
  `.standards/docs/specs/overdue-grace-period-20260924T090000Z-3e9a71c4.md`
- `Request`: `Two-day grace period and a 10.00 per-loan limit on overdue fees.`

## Build Steps

### DEV-001 — Apply the two-day grace period in overdue_fee

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Charge only for days beyond the first two days late.

**Affected Area**

`loans/fees.py`: new `GRACE_DAYS` constant and the body of `overdue_fee`.

**Expected Outcome**

Returns up to two days late cost nothing; from the third day late the fee is
the daily rate times the days beyond two. `days_late` keeps its meaning.

**Self-Check**

Planned: `python3 -m pytest` from the project root, plus a quick interpreter
check of 0, 2, 3, and 6 days late. Not yet run.

### DEV-002 — Limit the per-loan overdue fee to 10.00

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Never return a per-loan fee above 10.00.

**Affected Area**

`loans/fees.py`: new `MAX_FEE` constant and the return value of
`overdue_fee`. `loans/report.py` is unchanged.

**Expected Outcome**

A loan returned 60 days late costs exactly 10.00, and `member_total` sums the
limited per-loan fees.

**Self-Check**

Planned: `python3 -m pytest` from the project root, plus an interpreter check
of a very late return and of `member_total` over two very late loans. Not yet
run.

## Plan Notes

Project references loaded: `NONE`.
