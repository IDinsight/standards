<!-- STANDARDS
Artifact: REVIEW
Cycle: export-20260924T090000Z-a7f3c1d2
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `export-20260924T090000Z-a7f3c1d2` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode STANDARD. Current acceptance set: AC-001 and AC-002 from the
  scope (blob `${BLOB:.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md}`),
  no retired identifiers. Design blob
  `${BLOB:.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md}`; context
  blob `${BLOB:.standards/CONTEXT.md}`.
- Repository at `${COMMIT:Record verification of CSV export}`, clean working
  tree. Comparison range: `${COMMIT:Plan CSV export implementation}` (the last
  commit before implementation) to that commit. Changed source:
  `src/export.ts`, `src/routes/export.ts`, `src/app.ts`, `.gitignore`,
  `package.json`; changed tests: `test/export.test.ts`,
  `test/integration/export-flow.test.ts`. Unchanged boundaries read:
  `src/auth/authorize.ts`, `src/records/filter.ts`, `src/http/router.ts`,
  `src/routes/records.ts`.
- Development plan blob
  `${BLOB:.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md}`;
  verification report blob
  `${BLOB:.standards/docs/verification/export-20260924T090000Z-a7f3c1d2.md}`
  (FULL, complete).
- Excluded: `README.md` and `docs/usage.md`, which belong to the documentation
  phase.
- Session: opened in a fresh chat. The model that produced the work is not
  visible to Reviewer, so no model comparison is recorded.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| AC-001 / rows equal GET /records for the same query | export-flow owner and unfiltered scenarios; inspection of `src/routes/export.ts` | Supported |
| AC-001 / quoting and escaping per the design's CSV format | `test/export.test.ts`; diagnostic in Checks and Results | Finding F-001 |
| AC-001 / 201 headers and body equal to the written file | export-flow owner scenario | Supported |
| AC-001 / unknown status rejected before any write | export-flow unknown-status scenario | Supported |
| AC-002 / denied before any export file is created | export-flow anonymous, viewer, and editor scenarios; handler statement order | Supported |

## Checks and Results

- `pnpm --filter export test` in the project root at the assessed commit,
  Node 22, offline: exit 0; 21 passed, 0 failed.
- `pnpm --filter export test:integration` in the project root at the same
  commit: exit 0; 6 passed, 0 failed.
- Diagnostic: a `node -e` call in the project root imported `src/export.ts` and
  passed `csvCell` a title with a carriage return and no line feed. It came back
  unchanged, without enclosing quotes. The same title with CRLF came back
  quoted.
- Inspection of `src/routes/export.ts`: `requireAdmin(request.user)` runs before
  `parseFilter`, `store.list`, and `writeExport`.
- Tester execution results at the same commit are consistent with the reruns
  above.

## Findings

### F-001 — A field with a carriage return and no line feed is not quoted

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`: `IMPLEMENTATION`

- **Reference:** `src/export.ts`, `QUOTED_CHARACTERS` and `needsQuotes`, at
  `${COMMIT:Record verification of CSV export}`; design Interfaces and
  Contracts, CSV format; the AC-001 technical criterion on quoting and
  escaping.
- **Failure case:** a record title holding a carriage return without a line
  feed is written as a bare field, because the list holds comma, double quote,
  and LF but not CR.
- **Impact:** spreadsheet programs that treat a lone CR as a line break split
  the row, so the file no longer reads back as the filtered records.
- **Evidence:** the diagnostic in Checks and Results; the design names CR
  explicitly. The suites pass because their line-break scenarios contain LF.
- **Smallest correction:** quote any field that contains CR, as the design
  requires, without changing other output.
- **Reassessment:** pending.

## Questions, Limitations, and Later Dependencies

- The AC-001 verification evidence has no scenario with a CR-only field, so it
  could not detect this finding. After the correction, the rerun through
  TESTING has to re-establish AC-001 evidence before this review resumes.
- Later dependencies: NONE.
- Blocking user question: NONE.

## Progress and Conclusion

- Inspected all changed source and tests and the unchanged boundaries listed
  above; AC-002 and the other AC-001 criteria are supported.
- The gate does not pass: F-001 is open. Routed as IMPLEMENTATION to Developer;
  recovery routing is in `.standards/STATE.md`.
- Next action on resume: reconcile changed inputs, recheck F-001 against the
  corrected `src/export.ts` and the rerun verification evidence, and recheck
  the export route boundaries.
- Summary: the export works, but a title with a lone carriage return comes out
  unquoted and can break the CSV. Developer fixes `src/export.ts`, Tester
  re-verifies, then this review resumes.
