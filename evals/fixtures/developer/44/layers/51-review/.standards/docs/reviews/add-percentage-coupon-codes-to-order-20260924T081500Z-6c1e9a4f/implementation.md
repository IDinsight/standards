<!-- STANDARDS
Artifact: REVIEW
Cycle: add-percentage-coupon-codes-to-order-20260924T081500Z-6c1e9a4f
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `add-percentage-coupon-codes-to-order-20260924T081500Z-6c1e9a4f`
`ReviewKind`: `IMPLEMENTATION` `Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `EXPEDITED`. The contract is the bounded `Active Work.Request`:
  percentage coupon codes on order totals, discount rounded to the nearest
  cent.
- Assessed commit `${COMMIT:Add percentage coupons to order totals}` with a
  clean working tree: `src/coupons.js` (new), `src/totals.js` (changed), and
  the unchanged `test/totals.test.js`.
- Development plan
  `.standards/docs/development/add-percentage-coupon-codes-to-order-20260924T081500Z-6c1e9a4f.md`,
  Status COMPLETE at the assessed commit.
- No verification record or project context: Tester and Auditor are not part
  of an EXPEDITED cycle.
- Session: this review ran in a chat separate from the implementation work.
  The authoring model is not known.

## Contract and Evidence Assessment

| Obligation / criterion                                         | Assessed evidence                                  | Current disposition |
| -------------------------------------------------------------- | -------------------------------------------------- | ------------------- |
| Coupon codes resolve to percentages (bounded request)          | DEV-001 self-check; inspection of `src/coupons.js` | Supported           |
| Discount is the subtotal percentage rounded to the nearest cent | DEV-002 self-check; reproducer below               | Finding F-001       |
| Totals without a coupon are unchanged                          | `node --test test/totals.test.js`; inspection      | Supported           |

The Developer self-checks used amounts whose discounts are whole cents, so
they do not exercise rounding.

## Checks and Results

- `node --test test/totals.test.js` in the project root at the assessed
  commit: exit 0, 4 passed. Covers line totals and subtotals only.
- Reviewer diagnostic in the project root at the assessed commit: a `node -e`
  call of `orderTotal` with one `BAG-02` at 1995 cents and `SAVE10` printed
  `1796`. The discount is 199.5 cents, which rounds to 200, so the expected
  total is `1795`.

## Findings

### F-001 — Coupon discount truncates instead of rounding to the nearest cent

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/totals.js`, `discountCents`, at the assessed commit;
  bounded request (nearest-cent rounding).
- **Failure case:** any discount with a fractional part of half a cent or
  more, for example 1995 cents with `SAVE10`, totals 1796 instead of 1795.
- **Impact:** customers are overcharged by one cent on those orders.
- **Evidence:** the diagnostic in Checks and Results; `Math.floor` always
  rounds the discount down.
- **Smallest correction:** round the discount to the nearest cent in
  `discountCents`; no other behavior change.
- **Reassessment:** pending the Developer correction.

## Questions, Limitations, and Later Dependencies

NONE.

## Progress and Conclusion

- Inspection of both steps is complete. The gate does not pass because F-001 is
  open.
- Routed to Developer as an IMPLEMENTATION failure.
- On return: re-run the diagnostic and `node --test test/totals.test.js` on
  the corrected content, reassess F-001, and recheck that totals without a
  coupon are unchanged.
- Summary: work cannot move to sign-off yet. Coupon discounts can be one cent
  too small, which overcharges customers, and Developer fixes it. Lookup and
  uncouponed totals were checked and are sound.
