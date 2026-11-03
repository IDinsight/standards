<!-- STANDARDS
Artifact: REVIEW
Cycle: export-20260924T090000Z-a7f3c1d2
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `export-20260924T090000Z-a7f3c1d2` `ReviewKind`: `FINAL_DELIVERABLE`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Current acceptance set AC-001 and AC-002 (scope blob
  `${BLOB:.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md}`), design
  (blob `${BLOB:.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md}`),
  implementation review (blob
  `${BLOB:.standards/docs/reviews/export-20260924T090000Z-a7f3c1d2/implementation.md}`),
  documentation record (blob
  `${BLOB:.standards/docs/documentation/export-20260924T090000Z-a7f3c1d2.md}`).
- Assembled deliverable at `${COMMIT:Document CSV export}`, clean tree:
  `src/export.ts` (blob `${BLOB:src/export.ts}`) and `docs/usage.md`
  (blob `${BLOB:docs/usage.md}`).
- Session: separate from the authoring chats; no metadata is available.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| AC-001 | Verification E1, E2; `docs/usage.md` Exporting records | Supported |
| AC-002 | Verification E2 denied scenario; `docs/usage.md` Roles | Supported |
| Scope Goal and Assumptions: export files are kept | Design Risks; `writeExport`; R2 | Finding F-001 |

## Checks and Results

- R1: both test commands at the assessed commit: exit 0 (21 and 3 passed).
- R2: in-process run through one `createApp` with a fixed `now()`: admin
  exports with `owner=dana` and then `owner=li` in the same second both
  returned the same file name. The folder held one file, containing only li's
  records.

## Findings

### F-001 — Scope does not decide whether an export may replace an earlier export file

`Severity`: `P2` `Status`: `OPEN` `Owner`: `Scoper` `FailureType`:
`SCOPING`

- **Reference:** the scope's Goal and Assumptions (export files are kept for
  the admin tool); the design's Risks (same-second overwrite accepted);
  `src/export.ts` `writeExport`; `docs/usage.md` (the service keeps the file).
- **Failure case:** two administrators export different filters within one
  second, and the second file replaces the first.
- **Impact:** an export reported as saved is silently lost, so the guide's
  statement holds only some of the time.
- **Evidence:** R2. No acceptance condition says whether replacement is
  allowed.
- **Smallest correction:** Scoper decides whether an export may replace an
  earlier export file and records that decision as an acceptance condition.

## Questions, Limitations, and Later Dependencies

NONE.

## Progress and Conclusion

- The gate does not pass while F-001 is open. Routed to Scoper as a SCOPING
  failure; final review resumes after the correction and its reruns.
