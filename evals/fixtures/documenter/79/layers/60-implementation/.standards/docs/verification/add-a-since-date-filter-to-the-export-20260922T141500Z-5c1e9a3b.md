<!-- STANDARDS
Artifact: VERIFICATION
Cycle: add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b
-->

# Verification Report

`Cycle`: `add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b`
`Mode`: `REVERIFY` `Status`: `BLOCKED` `User Style`: `NONE`
`Assessment Purpose`: `CORRECTION`
`Assessment Target`: `Fixture timestamps in the --since scenario of test/export.test.js`

## Assessed Inputs

- Scope and design as committed in
  ${COMMIT:Record scope and design for export --since}; current acceptance set
  AC-001, AC-002, AC-003, AC-004.
- Development plan
  `.standards/docs/development/add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b.md`
  (DEV-001 reopened, DEV-002 done).
- Sources: src/export.js ${BLOB:src/export.js}; src/cli.js ${BLOB:src/cli.js}.
- Tests: test/export.test.js ${BLOB:test/export.test.js};
  test/import.test.js ${BLOB:test/import.test.js}.
- Environment: Node 22, TZ unset (UTC).
- Reason: correction of a Tester-owned scenario routed back from DEVELOPING
  (recovery Frame 2). The interrupted full assessment is saved under Resume or
  Handoff. Session freshness cannot be machine-certified.
- Project references loaded: NONE.

## Acceptance Evidence

| AC / technical criterion | Tests or checks                                                          | Disposition and evidence                                                        |
| ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| AC-001 / UTC boundary    | test/export.test.js: --since keeps items updated on or after the date    | Blocked: the scenario depends on the runner time zone; earlier pass superseded |
| AC-002                   | test/export.test.js: --since rejects a value that is not YYYY-MM-DD      | Passed in the run under Execution Evidence                                      |
| AC-003                   | test/export.test.js: exports every item with a header row               | Passed in the run under Execution Evidence                                      |
| AC-004                   | docs/export.md                                                           | Pending Documenter: guide section on --since                                    |

## Scenario Budget

| Source file   | Reused coverage                         | Active-change allocations                                                                   | User additions                       |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| src/export.js | exports every item with a header row    | 2 of 2: --since keeps items updated on or after the date; --since rejects an invalid value | NONE; increase of 2 requested        |
| src/cli.js    | NONE                                    | Counted with src/export.js (the invalid-date scenario exercises both)                       | NONE                                 |

## Execution Evidence

- `node --test test/export.test.js test/import.test.js` in the project root,
  on the inputs listed above, Node 22, TZ unset (UTC): exit 0; 7 tests, 7
  passed, 0 failed.
- Establishes AC-002 and AC-003 for the current sources. It does not establish
  AC-001: the since scenario would expect different rows under a non-UTC time
  zone.
- Superseded: the AC-001 pass from the first full-verification run no longer
  applies because src/export.js changed under DEV-001.

## Open Findings and Dependencies

- Frame 2 correction: the since scenario builds its late-evening timestamp from
  local-time Date parts, so it checks the UTC-day boundary only when the runner
  uses UTC. Required correction: fixed UTC timestamps on both sides of 00:00:00Z
  on the --since date. Covering both sides needs 2 scenarios beyond the
  src/export.js allocation; the user question is recorded in
  Active Work.BlockedOn.
- AC-001 also waits for Developer to finish DEV-001 (Frame 1).
- AC-004 depends on Documenter: docs/export.md must explain --since; required
  evidence is this cycle's documentation record.

## Resume or Handoff

Current assignment: CORRECTION for recovery Frame 2 (fixture timestamps in the
since scenario of test/export.test.js), taken up after the FAILURE handoff from
DEVELOPING. Next action once the scenario-budget question is answered: rewrite
the since scenario with fixed UTC timestamps, add the approved boundary
scenarios, rerun the command above, and return Frame 2 to Developer. The
suspended full assessment for Frame 1 follows.

### Suspended Assignment 1

`Recovery Frame`: `1`
`Recovery Reason`: `The --since filter drops items updated earlier on the given UTC day.`
`Purpose`: `FULL`
`Target`: `NONE`
`Assessed Inputs`: `scope and design as listed above; src/export.js before the DEV-001 reopening`
`Next Action`: `When Frame 1 resumes TESTING, reverify AC-001 to AC-003 against the corrected src/export.js and reconcile AC-004 with Documenter.`
