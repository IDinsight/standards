<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-discount-codes-to-invoices-20260922T143000Z-5c8e21a4
-->

# Development Plan

`Cycle`: `add-discount-codes-to-invoices-20260922T143000Z-5c8e21a4` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`INCREMENTAL` `Current Increment`: `1`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-discount-codes-to-invoices-20260922T143000Z-5c8e21a4.md`
- `Architecture`: `.standards/docs/specs/add-discount-codes-to-invoices-20260922T143000Z-5c8e21a4.md`
- `Request`: `Add percentage and fixed-amount discount codes to invoices, rejecting unknown and expired codes.`

## Build Steps

### DEV-001 — Code lookup, percentage codes, and discounted totals

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Look codes up in the catalog, apply percentage codes, and make `totals` tax the
discounted amount.

**Affected Area**

`src/discounts.js` (new) and `totals` in `src/invoice.js`.

**Expected Outcome**

`applyDiscount` returns a new frozen invoice with a percentage `discount`;
unknown and expired codes throw `DiscountError` with `UNKNOWN_CODE` or
`EXPIRED_CODE`; `totals` returns `discountCents` and computes tax on the
subtotal minus the discount, and is unchanged for invoices without a code.

**Self-Check**

Run from the project root on the DEV-001 working tree (new `src/discounts.js`,
modified `src/invoice.js`) before commit:

- `node --test test/invoice.test.js test/money.test.js` — exit 0, 7 passed, 0
  failed.
- A `node --input-type=module -e` script applying code `spring15` (catalog
  entry `SPRING15`, 15 percent, expires 2026-10-31, today 2026-09-24) to the
  invoice 3 x 4.99 plus 25.00 at 8 percent tax printed discountCents 600,
  taxCents 272, totalCents 3669. The same script with code `NOPE` threw
  `DiscountError` `UNKNOWN_CODE`, and with today 2026-11-01 threw
  `EXPIRED_CODE`.

Limitation: no discount-specific automated tests exist; formal verification is
Tester's.

**Implementation Notes**

Fixed-amount catalog entries throw `DiscountError` `UNSUPPORTED_KIND` until
DEV-002 adds them.

---

### DEV-002 — Fixed-amount codes

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-002, AC-004`

**Goal**

Support fixed-amount catalog entries.

**Affected Area**

`discountAmount` in `src/discounts.js`.

**Expected Outcome**

A fixed-amount code produces a discount equal to the lesser of its amount and
the subtotal; unknown and expired fixed-amount codes are rejected the same way
as percentage codes.

**Self-Check**

Planned: the existing suites plus a sanity script with a fixed code larger than
the subtotal.

---

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Ready Outcome**

Percentage codes from the catalog, matched case-insensitively after trimming,
reduce the taxable amount by their percentage of the subtotal rounded to whole
cents, and tax is computed on the reduced amount. Unknown codes and codes used
after their expiry date throw `DiscountError` and leave the input invoice
unchanged. Invoices without a code keep their previous subtotal, tax, and
total, with `discountCents` 0. Fixed-amount codes are not part of this
increment.

### Increment 2

`Development Steps`: `DEV-002` `Acceptance`: `AC-002, AC-004`

**Ready Outcome**

Fixed-amount codes reduce the taxable amount by their amount, never below zero,
and unknown or expired fixed-amount codes are rejected like percentage codes.

---

## Plan Notes

- The user approved this plan with INCREMENTAL cadence: Increment 1 is
  assessed before DEV-002 starts.
