<!-- STANDARDS
Artifact: VERIFICATION
Cycle: add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02
-->

# Verification Report

`Cycle`: `add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02` `Mode`: `VERIFY` `Status`:
`COMPLETE` `User Style`: `NONE`
`Assessment Purpose`: `FULL` `Assessment Target`: `NONE`

## Assessed Inputs

- Scope `.standards/docs/scope/add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02.md`
  and design `.standards/docs/specs/add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02.md`
  as of commit `${COMMIT:Record scope and design for overdue filter}`; current
  acceptance set AC-001, AC-002.
- Context `.standards/CONTEXT.md`; development plan
  `.standards/docs/development/add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02.md`
  (COMPLETE, DEV-001 DONE) as of commit `${COMMIT:Add overdue filter to task list}`.
- Implementation `src/tasks.js` blob `${BLOB:src/tasks.js}`; tests
  `test/tasks.test.js` blob `${BLOB:test/tasks.test.js}`, both at commit
  `${COMMIT:Add overdue filter tests}`. Clean working tree; no dependencies.
- Environment: Node 22, `node:test`.
- Reason: full verification after the Developer handoff, run in a chat separate
  from the implementation conversation. Session freshness is not
  machine-certified.
- Purpose FULL, target NONE: the whole current implementation contract.

## Acceptance Evidence

| AC / technical criterion               | Tests or checks                                                                                                                                                                                                                        | Disposition and evidence                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| AC-001 / Technical Acceptance Criteria | `test/tasks.test.js`: overdue returns open tasks due before today; overdue skips tasks without a due date; overdue treats a task due today as not overdue; existing status filter and ordering tests as regression                     | Verified; all passed (see Execution Evidence)                                                     |
| AC-002                                 | README update                                                                                                                                                                                                                          | Pending Documenter: the README must explain the overdue option; evidence goes in the documentation record |

## Scenario Budget

| Source file    | Reused coverage                                 | Active-change allocations                       | User additions |
| -------------- | ----------------------------------------------- | ----------------------------------------------- | -------------- |
| `src/tasks.js` | 2 existing scenarios (status filter, ordering)  | 3 overdue scenarios in `test/tasks.test.js`     | NONE           |

## Execution Evidence

- `node --test test/tasks.test.js` in the project root at commit
  `${COMMIT:Add overdue filter tests}`, clean tree: exit 0; tests 5, pass 5,
  fail 0, skipped 0.
- Establishes AC-001 behavior for the fixed `now` used in the tests. The
  default `now` (current time) path is covered by inspection only.
- No prior Tester evidence reused.

## Open Findings and Dependencies

- AC-002: pending Documenter (README). Required evidence: this cycle's
  documentation record.

## Resume or Handoff

Full verification is complete for the current implementation. Requested review
kind: IMPLEMENTATION. Evidence locations: this report and `test/tasks.test.js`.
AC-002 remains pending Documenter.
