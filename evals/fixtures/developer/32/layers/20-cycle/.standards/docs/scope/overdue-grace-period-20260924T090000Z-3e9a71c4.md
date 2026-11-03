<!-- STANDARDS
Artifact: SCOPE
Cycle: overdue-grace-period-20260924T090000Z-3e9a71c4
-->

# Overdue Fee Grace Period

## Goal

Members who return a loan a day or two late should not be charged, and no
single late return should produce a fee larger than 10.00. This reduces
disputes at the desk over small and very large fees.

## Constraints

- The existing daily rate of 0.25 is unchanged.
- Fees remain exact decimal amounts.

## Non-goals

- Changing the daily rate or making it configurable per member.
- Limiting a member's total across several loans.

## Work

### 1. Grace period

**Intent:** Stop charging for returns that are only slightly late.

**Done when:**

- `AC-001`: A loan returned one or two days after its due date incurs no
  overdue fee.
- `AC-002`: A loan returned three or more days late is charged the daily rate
  for each day beyond the first two.

**Depends on:** None.

### 2. Per-loan limit

**Intent:** Keep any single late return from producing an outsized fee.

**Done when:**

- `AC-003`: The overdue fee for a single loan never exceeds 10.00, and a
  member's total is the sum of the limited per-loan fees.

**Depends on:** Work item 1.
