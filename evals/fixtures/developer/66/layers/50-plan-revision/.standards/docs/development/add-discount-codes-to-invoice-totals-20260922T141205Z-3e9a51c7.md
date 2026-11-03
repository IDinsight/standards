<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7
-->

# Development Plan

`Cycle`: `add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7` `Mode`:
`STEPWISE` `User Style`: `tony.md.md` `User Style Locked`: `true` `Status`:
`PROPOSED` `Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`:
`NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7.md`
- `Architecture`:
  `.standards/docs/specs/add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7.md`
- `Request`: `Add discount codes to invoice totals.`

## Build Steps

### DEV-001 — Load and look up discount codes

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

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

- `npm test` in the project root, on ${COMMIT:Record approved development plan}
  plus the uncommitted `src/discounts.js` and `config/discounts.json`: exit 0,
  7 tests passed, 0 failed. This confirms existing totals and CLI behavior is
  unchanged; no existing test exercises the new module.
- `node --input-type=module -e "import { readFileSync } from 'node:fs'; import { parseDiscounts, findDiscount } from './src/discounts.js'; const table = parseDiscounts(readFileSync('config/discounts.json', 'utf8')); console.log(findDiscount(table, 'spring10'), findDiscount(table, 'nope'))"`
  in the project root printed the `SPRING10` entry (10 percent, expires
  2026-06-30) and `null`.

### DEV-002 — Apply the discount in order totals

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Compute discounted totals from a looked-up discount entry.

**Affected Area**

`src/totals.js`.

**Expected Outcome**

`orderTotals(order, discount)` returns `subtotalCents`, `discountCents`,
`taxCents`, and `totalCents`; the discount is rounded to the nearest cent and
tax is computed on the discounted subtotal. Without a discount,
`discountCents` is 0 and the other values match today's results.

**Self-Check**

`npm test` in the project root, plus `node --input-type=module -e` calls of
`orderTotals` with a 10 percent discount compared against hand-computed cents.

### DEV-003 — Show the discount line for a valid code

`Status`: `PENDING` `Depends On`: `DEV-002, DEV-004` `Acceptance`:
`AC-001, AC-004`

**Goal**

Pass an accepted code's entry into the totals and print the Discount line.

**Affected Area**

`src/cli.js`, `bin/invoice.js`.

**Expected Outcome**

With a valid code, output shows `Discount (CODE): -$X.YY` between Subtotal and
Tax, and Tax and Total reflect the discount. Without `--code`, output is
unchanged.

**Self-Check**

`npm test`; run `bin/invoice.js` on a sample order with and without
`--code STAFF15`, comparing against hand-computed output.

### DEV-004 — Parse --code and reject unusable codes

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Accept `--code <CODE>` and stop before any totals when the code is unknown or
expired.

**Affected Area**

`src/discounts.js` (expiry check), `src/cli.js`, `bin/invoice.js` (supplies
today's UTC date and the table path).

**Expected Outcome**

`--code` is read after the order file. An unknown code prints
`invoice: unknown discount code CODE` and an expired code prints
`invoice: discount code CODE expired on YYYY-MM-DD` on stderr, with exit status
2 and nothing on stdout. A code is usable through its `expires` date inclusive.

**Self-Check**

`npm test`; call `run()` with a stub `readFile` and `today` for an unknown code,
an expired code, and a code on its expiry date.

## Plan Notes

- Project references loaded: NONE.
- Revision after DEV-001, at the user's request: unknown and expired codes are
  now handled in their own step before any discount is applied. Rejection moved
  out of DEV-002 into new DEV-004, `--code` parsing moved from DEV-003 into
  DEV-004, and DEV-003 now depends on DEV-002 and DEV-004. DEV-001 is
  unaffected and stays DONE. DEV-002, DEV-003, and DEV-004 wait for approval of
  this revision.
