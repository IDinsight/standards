<!-- STANDARDS
Artifact: VERIFICATION
Cycle: add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e
-->

# Verification Report

`Cycle`: `add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e` `Mode`: `VERIFY` `Status`:
`COMPLETE` `User Style`: `NONE` `Assessment Purpose`: `FULL`
`Assessment Target`: `NONE`

## Assessed Inputs

- Scope `.standards/docs/scope/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`,
  design `.standards/docs/specs/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`,
  development plan `.standards/docs/development/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`
  (COMPLETE); current acceptance set AC-001 to AC-004.
- Implementation at commit `${COMMIT:Add per-project totals to weekly report}`;
  `src/report.js` blob `${BLOB:src/report.js}`, `src/cli.js` blob
  `${BLOB:src/cli.js}`.
- Test additions in this verification: `test/report.test.js` blob
  `${BLOB:test/report.test.js}`, `test/cli.test.js` blob `${BLOB:test/cli.test.js}`.
- Node.js 22 in the project root; no dependencies.
- Opened separately from the Developer conversation; session freshness cannot
  be certified.

## Acceptance Evidence

| AC / technical criterion | Tests or checks | Disposition and evidence |
| ------------------------ | --------------- | ------------------------ |
| AC-001 / tie order by name | test/report.test.js "projectTotals lists hours per project, largest first", "projectTotals orders projects with equal hours by name"; test/cli.test.js "--by-project lists each project under the total" | Verified: passed |
| AC-002 | test/report.test.js "projectTotals lists hours per project, largest first" (atlas 2.5 + 1.333 shown as 3.83) | Verified: passed |
| AC-003 | test/report.test.js "projectTotals ignores entries from neighbouring weeks"; previous-Sunday and next-Monday rows in the shared `week` data | Verified: passed |
| AC-004 | README.md | Pending Documenter: README section for `--by-project` |

## Scenario Budget

| Source file | Reused coverage | Active-change allocations | User additions |
| ----------- | --------------- | ------------------------- | -------------- |
| src/report.js | weekStart, weeklyTotal (2) | 3 projectTotals scenarios | NONE |
| src/cli.js | 2 existing report scenarios | 2 (--by-project listing, unknown option) | NONE |

## Execution Evidence

- `npm test` in the project root on the working tree over
  `${COMMIT:Add per-project totals to weekly report}` plus the test additions
  above: exit 0; 11 tests, 11 passed, 0 failed, 0 skipped.
- Covers the per-project grouping, ordering, rounding, and week filter through
  the public functions and `run`; the file-reading path of the CLI is not
  exercised (tests inject `read`).

## Open Findings and Dependencies

- AC-004: depends on Documenter; required evidence is a README section that
  explains `--by-project`, the week boundaries, and example output.

## Resume or Handoff

- Full verification complete for AC-001 to AC-003; AC-004 pending
  documentation. Hand off to implementation review (IMPLEMENTATION).
