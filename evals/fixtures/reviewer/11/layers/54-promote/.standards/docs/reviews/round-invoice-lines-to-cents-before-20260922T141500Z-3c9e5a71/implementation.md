<!-- STANDARDS
Artifact: REVIEW
Cycle: round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `EXPEDITED`; the contract is the bounded request in
  `Active Work.Request`: "Round invoice lines to cents before summing." No scope
  or design exists in expedited mode.
- Comparison range: baseline `${COMMIT:Initial invoice totals module}` to
  `${COMMIT:Round invoice lines to cents before summing}`; working tree clean
  (`git status --porcelain` empty). Changed path: `src/totals.js` (blob
  `${BLOB:src/totals.js}`).
- Affected unchanged boundaries: `src/invoice.js` (`summarize`, the only caller
  of `invoiceTotal`), `test/totals.test.js`, and `README.md`.
- Development plan:
  `.standards/docs/development/round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71.md`,
  DEV-001 `DONE`, plan `COMPLETE`.
- Context: `.standards/CONTEXT.md` does not exist; none is required by the
  expedited contract.
- Session: separate chat from the implementation conversation; model identity
  is not visible to this session.

## Contract and Evidence Assessment

| Obligation / criterion                                     | Assessed evidence                                              | Current disposition                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Bounded request: line totals rounded to cents              | `lineTotal` in `src/totals.js`; DEV-001 self-check; reproducer | Finding F-001: "cents" is undefined for currencies without two decimals  |
| Bounded request: invoice total is the sum of rounded lines | `invoiceTotal` in `src/totals.js`; DEV-001 self-check          | Supported for two-decimal currencies; depends on F-001 for the others    |

Only Developer self-checks and Reviewer diagnostics exist; there is no formal
Tester evidence in expedited mode.

## Checks and Results

- `node --test test/totals.test.js` in the project root on
  `${COMMIT:Round invoice lines to cents before summing}`: exit 0, 3 passed,
  0 failed. Establishes that existing behavior for whole-cent inputs is
  preserved; no test observes rounding or currency.
- `node --input-type=module -e "import { summarize } from './src/invoice.js'; console.log(summarize({ number: 'R-1', currency: 'JPY', lines: [{ quantity: 1.5, unitPrice: 1001 }] }).total)"`
  in the project root, same commit: printed `1501.5`.
- `node --input-type=module -e "import { lineTotal } from './src/totals.js'; console.log(lineTotal({ quantity: 3, unitPrice: 0.333 }))"`
  in the project root, same commit: printed `1`.

## Findings

### F-001 — Rounding unit undefined for currencies without two decimals

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Scoper`
`FailureType`: `SCOPING`

- **Reference:** `src/totals.js`, `toCents` (lines 3-5) at blob
  `${BLOB:src/totals.js}`; the bounded request's wording "cents".
- **Failure case:** a JPY invoice with one line of quantity 1.5 at 1001 totals
  `1501.5`; JPY has no minor unit, so that amount cannot be invoiced. A KWD
  invoice (three decimals) would lose its last digit.
- **Impact:** totals for invoices in currencies other than two-decimal ones are
  wrong or unpayable; `summarize` passes `currency` through with no check.
- **Evidence:** reproducer in Checks and Results; `README.md` states every
  invoice carries an ISO 4217 currency code.
- **Smallest correction:** define which currencies are supported, the rounding
  unit for each, and the behavior for unsupported codes; then implement and
  formally verify it. This needs Scoper-owned acceptance conditions and
  Tester-owned verification, which the expedited topology omits.

## Questions, Limitations, and Later Dependencies

- No formal Tester evidence exists in expedited mode; the assessment relies on
  Developer self-checks and the Reviewer diagnostics above.
- No other open questions.

## Progress and Conclusion

- Inspected: `src/totals.js`, `src/invoice.js`, `test/totals.test.js`,
  `README.md`, and the development plan.
- Gate not passed: F-001 is open, and its correction requires omitted standard
  guarantees. The cycle was promoted to STANDARD under Expedited Promotion; the
  reason is in `Active Work.PromotionReason`.
- Next action: reassess F-001 and the full contract against the implementation
  current at that time, reconciling every input listed above.
- Summary: the rounding works for dollars and euros, but the request never said
  what "cents" means for currencies such as yen, so the requirements must be
  settled and formally tested before this can move forward.
