<!-- STANDARDS
Artifact: REVIEW
Cycle: add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `STANDARD`; completion policy `IMPLEMENTATION_REVIEWED`, an
  explicit user choice saved in Active Work.Request; current acceptance set
  AC-001, AC-002, AC-003.
- Contract: scope, design, and `.standards/CONTEXT.md` at
  ${COMMIT:Record late fee scope and design}.
- Implementation, tests, development plan (COMPLETE), and verification report
  (COMPLETE) at ${COMMIT:Add late fee calculation and statement fees}; working
  tree clean when reviewed. Comparison range: pre-cycle code at
  ${COMMIT:Initial billing module} to that commit.
- Changed paths: `src/billing/lateFee.js` (new), `src/billing/statement.js`,
  `test/lateFee.test.js` (new), `package.json`. Affected unchanged boundaries:
  `src/billing/invoices.js`, `src/billing/reminders.js`,
  `test/statement.test.js`.
- Project references loaded: NONE.
- Session separate from the authoring chats; the models used by earlier roles
  are not visible here.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| --- | --- | --- |
| AC-001 / integer-cents criterion | `lateFeeCents` formula; day 15 and rounding scenarios in test/lateFee.test.js | Supported |
| AC-002 | grace and paid-invoice scenarios in test/lateFee.test.js | Finding F-002 |
| AC-003 / statement total criterion | `buildStatement`; statement scenario in test/lateFee.test.js | Finding F-001 |

## Checks and Results

- `npm test` in the project root, 2026-09-22, on the commit above, Node 22:
  exit 0, 12 tests passed. The statement scenario uses a date long past the due
  date, so it passes whatever the system clock reads.
- Inspection: `buildStatement` calls `lateFeeCents(invoice)` with no date;
  `lateFeeCents` defaults `asOf` to the current UTC date (DEV-001
  Implementation Notes).

## Findings

### F-001 — Statement late fees depend on the day the statement is generated

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Architect` `FailureType`:
`ARCHITECTURE`

- **Reference:** `src/billing/statement.js` `buildStatement` and
  `src/billing/lateFee.js` default `asOf`, at
  ${COMMIT:Add late fee calculation and statement fees}; design Decision and
  Interfaces and Contracts; AC-003.
- **Failure case:** A statement dated 2026-08-10 for an invoice due 2026-08-01
  shows no fee when built that day, but if the statement job rebuilds it on
  2026-08-20 it shows a 1.5% fee and a higher total.
- **Impact:** Statements are not reproducible and can show fees the customer did
  not owe on the statement date.
- **Evidence:** Inspection above. The design defines `lateFeeCents(invoice)`
  without an evaluation date, so the implementation fell back to the clock.
- **Smallest correction:** Architect defines which date fees are evaluated
  against and how it reaches `lateFeeCents`; implementation and verification
  then rerun.

### F-002 — Grace-period scenario stops one day early

`Severity`: `P2` `Status`: `OPEN` `Owner`: `Tester` `FailureType`:
`VERIFICATION`

- **Reference:** `test/lateFee.test.js` scenario 'no fee within the 14-day grace
  period'; AC-001, AC-002.
- **Failure case:** Counting the due date as day 1, 2026-08-15 is the fifteenth
  day of an invoice due 2026-08-01 and so past the grace period, yet the
  scenario expects a fee of 0.
- **Impact:** The boundary scenario would accept a grace period one day longer
  than scoped.
- **Evidence:** Test inspection.
- **Smallest correction:** Tester changes the boundary scenario to expect the
  fee on 2026-08-15 and adds a scenario for the last grace day.

## Questions, Limitations, and Later Dependencies

NONE. No later-role dependencies: under `IMPLEMENTATION_REVIEWED` no
documentation is planned for this change.

## Implementation-Reviewed Closure

`Policy`: `IMPLEMENTATION_REVIEWED` `Eligibility`: `INELIGIBLE` `User Choice`:
`Saved in Active Work.Request: finish after implementation review (IMPLEMENTATION_REVIEWED).`
`User Reason`: `The billing module is internal and this change needs no user-facing documentation.`
`Assessed Inputs`: `See Assessed Inputs and Scope.` `Evidence`:
`See Contract and Evidence Assessment.` `Unmet Requirements`:
`F-001 open (Architect); F-002 open (Tester); AC-002 and AC-003 lack sufficient evidence.`
`Omitted Phases`: `DOCUMENTING, REVIEWING_FINAL, SYNCHRONIZING`
`Omitted Guarantees`:
`Normal documentation, final review, and independent reconciliation omitted.`

Closure is ineligible while F-001 and F-002 are open and two acceptance
conditions lack sufficient evidence.

## Progress and Conclusion

- Inspected: scope, design, context, plan, verification report, both changed
  modules and their callers, and all test files.
- The gate does not pass: F-001 (P1) and F-002 (P2) are open.
- F-001 is routed first to Architect as an `ARCHITECTURE` failure; its
  correction changes the code and evidence under review, so implementation and
  verification rerun after it. F-002 stays open for Tester during that rerun.
- Next action on return: compare current inputs with the identities above,
  recheck both findings against current code and tests, reassess every current
  AC, then reassess closure.
- Summary: the fee arithmetic is right, but statements can show different fees
  depending on the day they are generated, and one grace-period test looks a
  day short. The design needs to say which date counts; then the code and tests
  are redone.
