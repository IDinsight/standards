<!-- STANDARDS
Artifact: DOCUMENTATION
Cycle: add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e
-->

# Documentation Record

`Cycle`: `add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e` `Status`: `COMPLETE`
`Collaboration`: `AUTONOMOUS` `Target`: `ACTIVE_CHANGE` `Target Detail`:
`active cycle` `User Style`: `NONE`

## Assessed Inputs and Boundary

- Scope, design, development plan, verification report, and implementation
  review for this cycle under `.standards/`.
- Implementation at `${COMMIT:Record implementation review for per-project totals}`;
  working tree clean apart from this documentation change.
- Editing boundary: `README.md` only. No other project documentation exists.

## Documentation Work and Evidence

- `README.md`, Usage and a new "Per-project totals" section, for people running
  the CLI. Satisfies AC-004 directly and describes the behavior behind AC-001
  (ordering and ties), AC-002 (two-decimal rounding), and AC-003 (the week runs
  Monday through Sunday). Saved content `${BLOB:README.md}`.
- Behavior taken from the scope, the design's Interfaces and Contracts section,
  `src/cli.js`, and the verification report; the example output uses the
  scenario data in `test/report.test.js`.

## Checks and Applicability

- Inspection: the README usage line matches `USAGE` in `src/cli.js`; the example
  values match `projectTotals` rounding (2.5 + 1.333 shown as 3.83) and the
  weekly total (9.08).
- `npm test` in the project root: exit 0, 11 tests passed (no documentation
  tests exist).

## Discrepancies, Dependencies, and Remaining Work

NONE.

## Resume and Conclusion

- Blocking question: NONE.
- Full Documenter gate passed for the current inputs; hand off to final review.
