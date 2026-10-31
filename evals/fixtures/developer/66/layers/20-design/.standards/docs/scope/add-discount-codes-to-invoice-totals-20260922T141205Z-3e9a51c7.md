<!-- STANDARDS
Artifact: SCOPE
Cycle: add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7
-->

# Discount Codes on Invoice Totals

## Goal

Let staff apply a published discount code when totaling an order with the
`invoice` command, so discounted orders no longer have to be recalculated by
hand.

## Constraints

- Codes and their percentages come from the discount table kept in the
  repository; the command does not accept ad hoc percentages.
- Output for orders without a code stays exactly as it is today; other scripts
  parse it.

## Non-goals

- Fixed-amount discounts, stacking several codes, or per-item discounts.
- Editing the discount table from the command line.

## Work

### 1. Apply a discount code

**Intent:** Staff can total a discounted order in one command.

**Done when:**

- `AC-001`: `invoice <order.json> --code <CODE>` with a known, unexpired code
  applies that code's percentage to the subtotal and prints a Discount line
  naming the code and the amount taken off.
- `AC-002`: Tax is computed on the discounted subtotal and rounded to the
  nearest cent.
- `AC-004`: Running without `--code` prints the same output as before this
  change.

**Depends on:** None

### 2. Reject unusable codes

**Intent:** A mistyped or out-of-date code never produces a wrong total.

**Done when:**

- `AC-003`: An unknown or expired code prints an error naming the code, exits
  with status 2, and prints no totals.

**Depends on:** None
