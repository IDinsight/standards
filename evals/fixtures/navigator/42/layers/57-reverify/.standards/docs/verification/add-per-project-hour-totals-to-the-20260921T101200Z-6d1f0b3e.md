<!-- STANDARDS
Artifact: VERIFICATION
Cycle: add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e
-->

# Verification Report

`Cycle`: `add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e` `Mode`: `REVERIFY` `Status`:
`COMPLETE` `User Style`: `NONE` `Assessment Purpose`: `FULL`
`Assessment Target`: `NONE`

## Assessed Inputs

- Scope `.standards/docs/scope/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`,
  design `.standards/docs/specs/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`,
  development plan `.standards/docs/development/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`
  (COMPLETE; DEV-002 reopened and DONE again); current acceptance set AC-001 to
  AC-004.
- Implementation at commit `${COMMIT:Include closing Sunday in per-project totals}`;
  `src/report.js` blob `${BLOB:src/report.js}`.
- Test change in this reverification: `test/report.test.js` blob
  `${BLOB:test/report.test.js}`; `test/cli.test.js` unchanged.
- Node.js 22 in the project root; no dependencies.
- Reason: recovery rerun. The final review's
  `.standards/docs/reviews/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e/final-deliverable.md#F-003`
  routed the closing-Sunday defect to Developer, who corrected DEV-002 and set
  the rerun through TESTING. This is a full reverification of the corrected
  implementation.
- Opened separately from the Developer conversation; session freshness cannot
  be certified.

## Acceptance Evidence

| AC / technical criterion | Tests or checks | Disposition and evidence |
| ------------------------ | --------------- | ------------------------ |
| AC-001 / tie order by name | test/report.test.js "projectTotals lists hours per project, largest first", "projectTotals orders projects with equal hours by name"; test/cli.test.js "--by-project lists each project under the total" | Verified: passed |
| AC-002 | test/report.test.js "projectTotals lists hours per project, largest first" (atlas 2.5 + 1.333 shown as 3.83) | Verified: passed |
| AC-003 / comparison against `end` is inclusive | test/report.test.js "projectTotals ignores entries from neighbouring weeks", "projectTotals includes entries dated on the Sunday that ends the week"; previous-Sunday and next-Monday rows in the shared `week` data | Verified: passed on the corrected implementation |
| AC-004 | README "Per-project totals" section; documentation record for this cycle (COMPLETE) | Documented by Documenter; no executable check |

## Scenario Budget

| Source file | Reused coverage | Active-change allocations | User additions |
| ----------- | --------------- | ------------------------- | -------------- |
| src/report.js | weekStart, weeklyTotal (2) | 4 projectTotals scenarios (closing Sunday added in this reverification) | NONE |
| src/cli.js | 2 existing report scenarios | 2 (--by-project listing, unknown option) | NONE |

## Execution Evidence

- `npm test` in the project root on the working tree over
  `${COMMIT:Include closing Sunday in per-project totals}` plus the test change
  above: exit 0; 12 tests, 12 passed, 0 failed, 0 skipped.
- Superseded: the AC-003 result recorded at
  `${COMMIT:Add per-project totals to weekly report}` did not exercise an entry on
  the closing Sunday; replaced by the result above.
- AC-001 and AC-002 scenarios were rerun in the same suite; no earlier result is
  reused.
- Limits: dates are compared as strings, relying on the parser's validated
  `YYYY-MM-DD` form; the CLI's file-reading path is not exercised (tests inject
  `read`).

## Resume or Handoff

- Full reverification complete for the corrected implementation. Recovery
  Frame 1 reached its rerun boundary; the workflow resumes final review
  (FINAL_DELIVERABLE), where Reviewer reassesses
  `.standards/docs/reviews/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e/final-deliverable.md#F-003`.
