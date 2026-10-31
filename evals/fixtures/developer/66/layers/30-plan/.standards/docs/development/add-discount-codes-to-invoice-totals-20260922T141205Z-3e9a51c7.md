<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7
-->

# Development Plan

`Cycle`: `add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7` `Mode`:
`STEPWISE` `User Style`: `tony.md.md` `User Style Locked`: `true` `Status`:
`APPROVED` `Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`:
`NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7.md`
- `Architecture`:
  `.standards/docs/specs/add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7.md`
- `Request`: `Add discount codes to invoice totals.`

## Build Steps

### DEV-001 — Load and look up discount codes

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

**Goal**

Read the discount table and find an entry by code, so later steps can apply or
reject a code from one validated source.

**Affected Area**

`src/discounts.js` (new), `config/discounts.json` (new).

**Expected Outcome**

`parseDiscounts(text)` returns entries with the code upper-cased, a whole
`percent` from 1 to 100, and an `expires` date, and throws on a malformed table
or entry. `findDiscount(table, code)` returns the matching entry regardless of
case, or `null`.

**Self-Check**

`npm test` in the project root, plus a `node --input-type=module -e` lookup
against `config/discounts.json`.

### DEV-002 — Apply discounts and reject unusable codes

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`:
`AC-001, AC-002, AC-003`

**Goal**

Compute discounted totals and refuse unknown or expired codes.

**Affected Area**

`src/totals.js`, `src/discounts.js` (expiry check).

**Expected Outcome**

`orderTotals(order, discount)` returns `subtotalCents`, `discountCents`,
`taxCents`, and `totalCents`, with tax on the discounted subtotal. Looking up an
unknown or expired code yields a rejection reason the command can print; a code
is usable through its `expires` date inclusive.

**Self-Check**

`npm test` in the project root, plus `node --input-type=module -e` calls of
`orderTotals` with a 10 percent discount compared against hand-computed cents.

### DEV-003 — Add the --code flag and the discount line

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`:
`AC-001, AC-003, AC-004`

**Goal**

Expose discount codes on the command line.

**Affected Area**

`src/cli.js`, `bin/invoice.js`.

**Expected Outcome**

`--code <CODE>` is read after the order file. A valid code adds
`Discount (CODE): -$X.YY` between Subtotal and Tax; an unknown or expired code
prints the design's error on stderr and exits 2 with no totals. Without
`--code`, output is unchanged.

**Self-Check**

`npm test`; run `bin/invoice.js` on a sample order with and without
`--code STAFF15` and with an unknown code, comparing against hand-computed
output and exit status.

## Plan Notes

- Project references loaded: NONE.
