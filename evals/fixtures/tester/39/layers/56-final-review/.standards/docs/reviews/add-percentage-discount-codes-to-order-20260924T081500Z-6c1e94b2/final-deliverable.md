<!-- STANDARDS
Artifact: REVIEW
Cycle: add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2`
`ReviewKind`: `FINAL_DELIVERABLE` `Status`: `BLOCKED` `User Style`: `alice`

## Assessed Inputs and Scope

- Assembled deliverable at commit `${COMMIT:Document discount codes in README}`:
  `README.md`, `src/discounts.js` (blob `${BLOB:src/discounts.js}`),
  `src/totals.js`, both test files, verification report, implementation
  review, and documentation record. Cycle mode STANDARD, completion policy
  FULL_DELIVERABLE; current acceptance set AC-001, AC-002, AC-003.
- Project references loaded: NONE.
- Reviewed in a chat separate from the authoring conversations; model identity
  of earlier sessions is not available to this report.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| --- | --- | --- |
| AC-001 / Technical Acceptance Criteria | README example; verification report; `orderTotals` | Supported |
| AC-002 | README; `lookupDiscount` error paths; verification report | Supported |
| AC-003 / Technical Acceptance Criteria | README states codes are valid through the expiry date; `lookupDiscount` | Finding F-001 |

## Checks and Results

- `npm test` in the project root at the commit above: exit 0, 5 passed.
- In the project root:
  `node -e "import('./src/discounts.js').then((m) => console.log(m.lookupDiscount('SPRING10', '2026-12-31')))"`
  threw `DiscountError: Discount code SPRING10 is expired`.

## Findings

### F-001 — Codes are rejected on their expiry date

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/discounts.js`, `lookupDiscount`, the comparison
  `entry.expires <= today`; AC-003 and its technical criterion.
- **Failure case:** `lookupDiscount('SPRING10', '2026-12-31')` throws
  "expired" although SPRING10 expires on 2026-12-31.
- **Impact:** customers lose a valid discount on its last day, and the README
  promises the opposite.
- **Evidence:** reproduction above; the existing tests check only a date after
  expiry.
- **Smallest correction:** accept a code on its expiry date and reject it only
  once `today` is after that date.

## Questions, Limitations, and Later Dependencies

- The verification evidence has no scenario on the expiry date itself; the
  correction needs fresh verification before this review resumes.

## Progress and Conclusion

- The final-deliverable gate does not pass. Routed as an IMPLEMENTATION
  failure to Developer; resume this review after the correction and its reruns.
