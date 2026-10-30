<!-- STANDARDS
Artifact: REVIEW
Cycle: export-20260924T090000Z-a7f3c1d2
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `export-20260924T090000Z-a7f3c1d2` `ReviewKind`: `FINAL_DELIVERABLE`
`Status`: `IN_PROGRESS` `User Style`: `NONE`

## Assessed Inputs and Scope

- Reason for this assessment: re-review after the synchronization
  discrepancy
  `.standards/docs/synchronization/export-20260924T090000Z-a7f3c1d2.md#D-001`,
  which found that the earlier conclusion assessed a usage guide that has
  since changed.
- Cycle mode `STANDARD`, completion policy `FULL_DELIVERABLE`. Scope
  `.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md`
  (blob `${BLOB:.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md}`):
  current acceptance set AC-001, AC-002, and AC-003; no retired identifiers.
- Technical design `.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md`
  (blob `${BLOB:.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md}`);
  project context `.standards/CONTEXT.md` (blob `${BLOB:.standards/CONTEXT.md}`).
- Development plan (blob
  `${BLOB:.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md}`),
  `COMPLETE`; verification report (blob
  `${BLOB:.standards/docs/verification/export-20260924T090000Z-a7f3c1d2.md}`),
  `COMPLETE`, purpose `FULL`; implementation review (blob
  `${BLOB:.standards/docs/reviews/export-20260924T090000Z-a7f3c1d2/implementation.md}`),
  `COMPLETE`; documentation record (blob
  `${BLOB:.standards/docs/documentation/export-20260924T090000Z-a7f3c1d2.md}`),
  `COMPLETE`; synchronization record (blob
  `${BLOB:.standards/docs/synchronization/export-20260924T090000Z-a7f3c1d2.md}`),
  `IN_PROGRESS`.
- Re-review revision: commit
  `${COMMIT:Record synchronization discrepancy for CSV export}` with a clean
  working tree. Outside `.standards/`, the only change since the earlier
  assessed revision `${COMMIT:Record CSV export documentation}` is
  `docs/usage.md`, whose Limits section was rewritten by
  `${COMMIT:Clarify export file naming in usage guide}`; current content blob
  `${BLOB:docs/usage.md}`. `README.md` (blob `${BLOB:README.md}`) is
  unchanged.
- Implementation and tests, unchanged since the earlier pass: `src/export.ts`
  (blob `${BLOB:src/export.ts}`), `src/routes/export.ts`
  (blob `${BLOB:src/routes/export.ts}`), `src/app.ts` (blob `${BLOB:src/app.ts}`),
  `package.json` (blob `${BLOB:package.json}`), `test/export.test.ts`
  (blob `${BLOB:test/export.test.ts}`), `test/integration/export-flow.test.ts`
  (blob `${BLOB:test/integration/export-flow.test.ts}`).
- Superseded assessment: the earlier pass assessed revision
  `${COMMIT:Record CSV export documentation}` with the guide as committed by
  `${COMMIT:Document CSV export in usage guide}`. Its `COMPLETE` conclusion
  does not apply to the current guide and is withdrawn below.
- Environment: Node 22, pnpm 10 workspace, offline.
- Session: this re-review ran in a chat separate from the conversations that
  produced the guide and the other records under review. The client exposes no
  session or model metadata, so freshness and author model are stated
  limitations, not attestations.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| AC-001 / CSV format and RFC 4180 quoting | Verification E1; implementation review R1 and R3; C1; C6 | Supported |
| AC-001 / exported rows equal `GET /records` for the same query, in id order | Verification E2 and I1; C2; C6 | Supported |
| AC-001 / 201 response, CSV headers, body equal to the written file | Verification E2; C2; C6 | Supported |
| AC-002 / no user 401, editor or viewer 403, no export folder or file | Verification E2 and I1; implementation review R3; C2; C6 | Supported |
| AC-003 / usage guide accurately describes the export | C3 (earlier guide content, superseded); C7 | Finding F-001; not supported for the current guide |

## Checks and Results

- C1 to C5: the earlier pass at `${COMMIT:Record CSV export documentation}`
  (C1 21 passed, C2 3 passed, C3 to C5 inspections). C1 and C2 still apply
  because C6 shows the implementation and test content unchanged. C3 to C5
  assessed the earlier guide and are superseded for the current guide.
- C6: `git diff --name-only ${COMMIT:Record CSV export documentation} HEAD -- . ':!.standards'`
  in the project root at the re-review revision: `docs/usage.md` only. The
  implementation and test blobs equal those listed above.
- C7: inspection of the current Limits section against `exportFileName` and
  `writeExport` in `src/export.ts`. The file name comes only from the
  request's UTC second, and `writeFileSync` writes it without checking for an
  existing file, so a second export in the same second replaces the first. A
  one-off Node script, not committed, run in the project root against
  `createApp` with a fixed `now` and a temporary export folder made two admin
  exports (`owner=dana`, then `owner=marco`): one file remained,
  `records-20260924T090000Z.csv`, holding the second export. Exit 0; the
  temporary folder was removed.
- Not yet done: reassessment of the guide after Documenter's correction.

## Findings

### F-001 — Usage guide says same-second exports get a numeric suffix

`Severity`: `P2` `Status`: `OPEN` `Owner`: `Documenter` `FailureType`: `DOCUMENTATION`

- **Reference:** `docs/usage.md`, section "Exporting records as CSV",
  subsection "Limits", content `${BLOB:docs/usage.md}`; AC-003.
- **Failure case:** two admin exports in the same second. The guide says the
  later one is saved as `records-<YYYYMMDDTHHMMSSZ>-1.csv` and the earlier
  file is kept; the service writes both to the same
  `records-<YYYYMMDDTHHMMSSZ>.csv`, and the earlier file is replaced.
- **Impact:** administrators who rely on the guide expect both exports to
  survive and lose the first one without notice. AC-003 requires the guide to
  describe accurately what an export writes.
- **Evidence:** C7.
- **Smallest correction:** the guide states that exports in the same second
  share a file name and the later replaces the earlier, as the design's
  accepted risk records.
- **Reassessment:** pending Documenter's correction.

## Questions, Limitations, and Later Dependencies

- Dependency: correction of F-001, owner Documenter. This review resumes on
  return and reassesses the guide.
- The synchronization discrepancy
  `.standards/docs/synchronization/export-20260924T090000Z-a7f3c1d2.md#D-001`
  awaits this review's current conclusion; Synchronizer disposes of it.
- Non-material limitation: session and model metadata unavailable.
- Blocking user question: NONE.

## Progress and Conclusion

- Completed: C6, C7, and the finding above.
- Remaining: on return, compare `docs/usage.md` with the content identity
  above, recheck F-001, repeat C3 and C4 against the current guide, rerun C1
  and C2 if any implementation or test content changed, then record a
  conclusion.
- The final-deliverable gate does not pass now. The earlier `COMPLETE`
  conclusion is withdrawn because it assessed different guide content.
- Summary: the export implementation is still sound and unchanged, but the
  usage guide now promises a file-naming behavior the service does not have.
  Documenter fixes the guide; this review then finishes its reassessment.
- Next: `DOCUMENTING` for F-001 (see `.standards/STATE.md`).
