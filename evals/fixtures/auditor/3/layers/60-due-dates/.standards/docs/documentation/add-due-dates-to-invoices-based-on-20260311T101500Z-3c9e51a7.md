<!-- STANDARDS
Artifact: DOCUMENTATION
Cycle: add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7
-->

# Documentation Record

`Cycle`: `add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7` `Status`: `COMPLETE`
`Collaboration`: `AUTONOMOUS` `Target`: `ACTIVE_CHANGE` `Target Detail`:
`active cycle` `User Style`: `NONE`

## Assessed Inputs and Boundary

- This cycle's scope, design, plan, verification report, and implementation
  review; `services/billing/src/invoice.js` as reviewed.
- Editing boundary: `README.md` only.

## Documentation Work and Evidence

- `README.md`, new `Invoices` section, for anyone calling `createInvoice`:
  explains the 30-day default and `termsDays`. Covers AC-003. Checked against
  `createInvoice` in `services/billing/src/invoice.js`.
- AC-001, AC-002: no further documentation impact beyond that section.

## Checks and Applicability

- Inspection: the README statement matches the default and override in
  `invoice.js` and the verified tests.

## Discrepancies, Dependencies, and Remaining Work

NONE

## Resume and Conclusion

- Blocking question: `NONE`.
- The full Documenter gate passed; next is final review (FINAL_DELIVERABLE).
