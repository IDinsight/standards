<!-- STANDARDS
Artifact: SCOPE
Cycle: customer-totals-report-20260922T141500Z-3e8b1f5a
-->

# Customer Totals Report

## Goal

Let staff see how much each customer ordered in an orders export, ranked from
the largest total, directly from the `orders` CLI instead of a spreadsheet.

## Constraints

- Input is the existing orders CSV format read by `orders summary` (header
  `id,customer,amount,date`, amounts with at most two decimals).
- Amounts are shown with two decimals, as `orders summary` shows them.

## Non-goals

- Filtering by date or any other column.
- Machine-readable output such as CSV or JSON.
- Any change to `orders summary` output.

## Work

### 1. Per-customer totals command

**Intent:** Give a per-customer view of an export without leaving the command
line.

**Done when:**

- `AC-001`: `orders totals <file>` prints exactly one line per customer that has at least one order in the file, in the form `<customer>: <total>`, where the total is the sum of that customer's order amounts shown with two decimals.
- `AC-002`: The lines are ordered from the highest total to the lowest, and customers with equal totals are ordered alphabetically by name.

**Depends on:** None

## Assumptions

- Customer names are compared exactly as written in the file; differently
  spelled names are separate customers.
