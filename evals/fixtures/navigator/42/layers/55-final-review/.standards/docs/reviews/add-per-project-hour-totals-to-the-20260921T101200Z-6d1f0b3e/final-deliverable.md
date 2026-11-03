<!-- STANDARDS
Artifact: REVIEW
Cycle: add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e` `ReviewKind`: `FINAL_DELIVERABLE`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- STANDARD cycle; current acceptance set AC-001, AC-002, AC-003, AC-004 in
  `.standards/docs/scope/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`;
  design `.standards/docs/specs/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`.
- Assembled deliverable at commit `${COMMIT:Document per-project totals}`;
  working tree clean. `src/report.js` blob `${BLOB:src/report.js}`, `README.md`
  blob `${BLOB:README.md}`.
- Development plan (COMPLETE), verification report (COMPLETE, FULL),
  implementation review (COMPLETE), and documentation record (COMPLETE) for this
  cycle under `.standards/docs/`.
- Included the four source files, the three test files, and `README.md`.
- Opened in a chat separate from the authoring sessions; model identities were
  not available, so no model comparison is claimed.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| AC-001 / tie order by name | `projectTotals` sort and `run`; ordering scenarios in test/report.test.js and test/cli.test.js; README example | Supported |
| AC-002 | `round` after summing; atlas 3.833 shown as 3.83 | Supported |
| AC-003 / comparison against `end` is inclusive | `projectTotals` filter in src/report.js; README says Monday through Sunday | Finding F-003 |
| AC-004 | README "Per-project totals" section; documentation record | Supported |

## Checks and Results

- `npm test` in the project root at `${COMMIT:Document per-project totals}`:
  exit 0, 11 tests passed.
- In the project root at the same commit, `projectTotals` called through
  `node -e` with a single entry `{ date: '2026-09-20', project: 'cobalt', hours: 2 }`
  for report date 2026-09-16 printed `[]`. `weeklyTotal` for the same input
  returned `{ week: '2026-09-14', hours: 2 }`.
- None of the existing scenarios places an entry on the Sunday of the selected
  week, so the passing suite does not exercise this boundary.

## Findings

### F-001 — Rounded project lines may not add up to the weekly total

`Severity`: `P2` `Status`: `WITHDRAWN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `projectTotals` rounds each project after summing;
  `weeklyTotal` rounds the overall sum. AC-002.
- **Failure case:** three projects at 1.333 h each print 1.33 h each under a
  total of 4 h.
- **Impact:** the listed lines can differ from the total by a hundredth of an
  hour.
- **Evidence:** source inspection.
- **Smallest correction:** none required.
- **Reassessment:** withdrawn. AC-002 asks only for per-line rounding, and the
  README says the lines may differ slightly from the total. Kept as a limitation
  below.

### F-002 — Empty week prints no project lines

`Severity`: `P2` `Status`: `WITHDRAWN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `run` in src/cli.js with `--by-project` for a week without
  entries.
- **Failure case:** the output is only the total line, `Week of <monday>: 0 h`.
- **Impact:** none beyond the documented behavior.
- **Evidence:** source inspection.
- **Smallest correction:** none required.
- **Reassessment:** withdrawn. The design's Interfaces and Contracts section
  specifies this output and the README documents it.

### F-003 — Per-project totals drop entries dated on the closing Sunday

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/report.js`, `projectTotals`, the line
  `if (entry.date < start || entry.date >= end) continue;` (blob
  `${BLOB:src/report.js}`); AC-003 and the design's technical criterion that the
  comparison against `end` is inclusive.
- **Failure case:** for report date 2026-09-16 the week is 2026-09-14 to
  2026-09-20; an entry dated 2026-09-20 is skipped by `projectTotals` but
  counted by `weeklyTotal`.
- **Impact:** `report --by-project` leaves out every project's Sunday hours, so
  the project lines disagree with the total line and with the README's
  Monday-through-Sunday description.
- **Evidence:** the `node -e` diagnostic under Checks and Results printed `[]`
  for a week whose only entry is on Sunday.
- **Smallest correction:** count entries with `start <= date <= end`, plus
  Tester-owned coverage for an entry on the closing Sunday.
- **Reassessment:** not yet reassessed. When the recovery returns to final
  review, inspect the corrected filter and the test changes, rerun `npm test`
  and the diagnostic above, and check the verification report's updated AC-003
  evidence.

## Questions, Limitations, and Later Dependencies

- Rounded project lines can differ from the total by a hundredth of an hour
  (see F-001); documented and non-blocking.
- Blocking user question: NONE.
- Later dependencies: NONE.

## Progress and Conclusion

- Completed: contract assessment for AC-001 to AC-004, test run, the Sunday
  boundary diagnostic, and a README cross-check.
- The final-deliverable gate does not pass: F-003 is open.
- F-003 is routed to Developer as an IMPLEMENTATION failure. When the recovery
  resumes final review, reassess F-003 as its Reassessment line describes, then
  recheck the README example and the remaining AC-003 evidence before deciding
  the gate.
- Summary: the per-project report is not ready for sign-off. Sunday hours are
  missing from the per-project lines; Developer fixes the filter, Tester
  reverifies, and this review then resumes.
