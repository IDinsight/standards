<!-- STANDARDS
Artifact: REVIEW
Cycle: sort-tasks-by-due-date-20260922T141000Z-3c9e1f5a
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `sort-tasks-by-due-date-20260922T141000Z-3c9e1f5a` `ReviewKind`: `IMPLEMENTATION`
`Status`: `COMPLETE` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `EXPEDITED`; the bounded request in `Active Work.Request`: sort
  the task list by due date, with undated tasks last. No scope or design
  artifacts exist for an expedited cycle.
- Development plan
  `.standards/docs/development/sort-tasks-by-due-date-20260922T141000Z-3c9e1f5a.md`
  (DEV-001 `DONE`, plan `COMPLETE`).
- Uncommitted implementation in the working tree: `src/tasks.js`
  (`${BLOB:src/tasks.js}`), `src/cli.js` (`${BLOB:src/cli.js}`),
  `test/tasks.test.js` (`${BLOB:test/tasks.test.js}`). No other staged,
  untracked, or deleted project paths.
- Unchanged boundaries checked: `parseTasks`, `formatTask`, `summarize`, and
  the `tasks.example.json` format.
- Session and model metadata were not available; this review worked from the
  persisted plan and the working tree.

## Contract and Evidence Assessment

| Obligation / criterion                         | Assessed evidence                              | Current disposition |
| ---------------------------------------------- | ---------------------------------------------- | ------------------- |
| Bounded request: earliest due date first       | `sortByDue` in src/tasks.js; Reviewer test run | Supported           |
| Bounded request: undated tasks last            | `sortByDue` null handling; Reviewer test run   | Supported           |
| Existing line format and open/done count kept  | `formatTask` and `summarize` unchanged         | Supported           |

The plan's self-checks are Developer feedback; the runs below are Reviewer
diagnostics. An expedited cycle has no Tester evidence.

## Checks and Results

- `node --test test/tasks.test.js` in the project root on the content above:
  exit 0, 7 passed, 0 failed.
- `node src/cli.js tasks.example.json --all` in the project root: exit 0;
  printed the electricity bill, the plumber, the passport, then the undated
  club book, followed by `3 open, 1 done`.
- Inspection of `sortByDue`: it returns a new array without mutating its
  input, and ties keep file order.

## Findings

No material findings.

## Questions, Limitations, and Later Dependencies

NONE. Due dates are compared as strings; `parseTasks` only accepts
YYYY-MM-DD, so string order matches date order.

## Progress and Conclusion

- Inspection complete; no remaining checks.
- The implementation review gate passes: the change does what the request asks
  and leaves the existing output format and counts alone.
- Summary: the work can go to user sign-off. Nothing needs fixing. Checked the
  sorting logic, its tests, and the CLI output on the example file.
