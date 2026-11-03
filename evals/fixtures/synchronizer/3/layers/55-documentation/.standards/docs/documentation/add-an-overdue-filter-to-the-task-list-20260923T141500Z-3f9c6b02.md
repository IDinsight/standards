<!-- STANDARDS
Artifact: DOCUMENTATION
Cycle: add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02
-->

# Documentation Record

`Cycle`: `add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02` `Status`: `COMPLETE`
`Collaboration`: `AUTONOMOUS` `Target`: `ACTIVE_CHANGE` `Target Detail`:
`active cycle` `User Style`: `NONE`

## Assessed Inputs and Boundary

- Scope, design, development plan, verification report, and implementation
  review for this cycle as of commit `${COMMIT:Record implementation review}`;
  implementation `src/tasks.js` blob `${BLOB:src/tasks.js}`.
- Baseline: `README.md` as of `${COMMIT:Record implementation review}`. Edited
  `README.md` at commit `${COMMIT:Document overdue filter in README}`, blob
  `${BLOB:README.md}`. Clean working tree.
- Editing boundary: `README.md` only. No agent guidance needed changes; the
  managed blocks in `AGENTS.md` and `CLAUDE.md` were not touched.
- No user style selected.

## Documentation Work and Evidence

- `README.md`, Usage section, new usage line and "Overdue tasks" subsection.
  Audience: developers calling `listTasks`. Satisfies AC-002.
- The text describes the behavior verified under AC-001 and the design's
  Interfaces and Contracts: open tasks only, undated tasks never overdue, a task
  due today is not overdue, today taken from the UTC date of `now`, and the
  optional `now` argument.
- Owner evidence inspected: `src/tasks.js`, the verification report's Execution
  Evidence, and the implementation review's Checks and Results.
- Outcome: applied and inspected complete.

## Checks and Applicability

- Inspection: compared every statement in the new subsection and the new usage
  line with `src/tasks.js` blob `${BLOB:src/tasks.js}` and the design; all
  match.
- Ran the README `now` example with `node --input-type=module` in the project
  root against the sample tasks from `test/tasks.test.js`: it returned the two
  open tasks due before 2026-09-24, as documented.
- No prior documentation evidence reused.

## Discrepancies, Dependencies, and Remaining Work

NONE. The README was the only documentation surface affected by this change.

## Resume and Conclusion

- Next action: none for Documenter.
- Blocking question: NONE.
- The selected target and the full Documenter gate are complete for the current
  inputs; the normal handoff is to the final deliverable review. This is not
  cycle completion or sign-off.
