<!-- STANDARDS
Artifact: REVIEW
Cycle: guide-20261004T120000Z-1a2b3c4d
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `guide-20261004T120000Z-1a2b3c4d` `ReviewKind`: `FINAL_DELIVERABLE`
`Status`: `IN_PROGRESS` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `DOCUMENTATION`, completion policy `NONE`. Current acceptance set:
  AC-001, AC-002, AC-003 in
  `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`; no retired IDs.
- Scope, design (`.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`),
  and `.standards/CONTEXT.md` as committed in
  ${COMMIT:Record documentation context, scope, and design}.
- `docs/guide.md` at blob `${BLOB:docs/guide.md}` and the documentation record
  `.standards/docs/documentation/guide-20261004T120000Z-1a2b3c4d.md`, both from
  ${COMMIT:Add tally user guide}. Editing boundary: `docs/guide.md` only.
- Supporting behavior sources: `bin/tally.js`, `src/cli.js`, `src/parse.js`,
  `src/summary.js`, and `test/`, unchanged since
  ${COMMIT:Add CLI tests and sample data}. Used as evidence of existing
  behavior, not as formal current-cycle verification.
- Re-review input: the synchronization record
  `.standards/docs/synchronization/guide-20261004T120000Z-1a2b3c4d.md` as
  committed in ${COMMIT:Record final review and synchronization findings}.
- Development, verification, and implementation-review records are omitted by
  the documentation cycle and were not required.
- Project references loaded: `NONE`.
- Session: first pass and re-review ran in chats separate from the
  documentation and synchronization work. Model identities of the authoring
  sessions are not visible.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| --- | --- | --- |
| AC-001 / design Interfaces and Contracts (command line, output) | `docs/guide.md` § Running tally; `main` and `parseArgs` in `src/cli.js`, `formatSummary` in `src/summary.js`; example rerun | Supported |
| AC-002 / design Interfaces and Contracts (input, errors) | `docs/guide.md` § Input file; `parseEntries` in `src/parse.js`, error handling in `main`; invalid-date rerun | Supported |
| AC-003 / design Interfaces and Contracts (options) | `docs/guide.md` § Options: `--by` (default `project`), `--from` (inclusive, no lower limit when unset), `--to` (inclusive, no upper limit when unset); `parseArgs` in `src/cli.js`, `filterByDate` and `summarize` in `src/summary.js`; combined-example and `--to` reruns | Supported in re-review; the first pass did not record `--to` (`.standards/docs/synchronization/guide-20261004T120000Z-1a2b3c4d.md#D-001`) |

The documentation record's checks were rerun rather than relied on by label.

## Checks and Results

- First pass, at ${COMMIT:Add tally user guide}, clean working tree:
  `npm test` in the project root, exit 0, 10 tests, 10 passed. Wrote the
  guide's example input to `/tmp/review-guide.csv`;
  `node bin/tally.js /tmp/review-guide.csv` and the § Options combined command
  printed exactly the guide's output blocks, exit 0. An invalid-date row gave
  `tally: line 2: date must be YYYY-MM-DD` plus the usage line, exit 2.
- Re-review, at ${COMMIT:Record final review and synchronization findings},
  guide and source unchanged: `node bin/tally.js /tmp/review-guide.csv --to 2026-09-01`
  printed alpha 3.50, beta 1.50, TOTAL 5.00, exit 0, so the upper bound is
  inclusive; `--to 2026-9-1` was rejected with `tally: --to must be YYYY-MM-DD`,
  exit 2. Both match § Options.
- Re-review read the synchronization record's § Completion and Evidence
  References against `docs/guide.md`; see F-001.

## Findings

### F-001 — Synchronization record cites the wrong guide section for AC-002

`Severity`: `P2` `Status`: `OPEN` `Owner`: `Synchronizer` `FailureType`:
`SYNCHRONIZATION`

- **Reference:** `.standards/docs/synchronization/guide-20261004T120000Z-1a2b3c4d.md`,
  § Completion and Evidence References, AC-002 bullet, as committed in
  ${COMMIT:Record final review and synchronization findings}. Relates to
  AC-002.
- **Failure case:** The bullet names `docs/guide.md` § Options as the guide
  evidence for AC-002. § Options covers the command-line options; the required
  columns, date and hours rules, extra-column handling, and row errors that
  AC-002 requires are in § Input file.
- **Impact:** The record's applicability reasoning for AC-002 points at a
  section that does not contain the evidence, so a reconciliation or sign-off
  check that follows the reference cannot find support for AC-002.
- **Evidence:** Read the AC-002 bullet and both guide sections in blob
  `${BLOB:docs/guide.md}`; the documentation record's AC-002 entry correctly
  names § Input file.
- **Smallest correction:** Synchronizer points the AC-002 reference at
  § Input file and rechecks its applicability reasoning.
- **Reassessment:** Pending Synchronizer correction.

## Questions, Limitations, and Later Dependencies

- No open questions and no blocking user decision.
- Limitation: authoring-session model identities are unknown; not material to
  this gate because the assessment is reconstructed from saved files and reruns.
- Later dependencies: NONE. The synchronization discrepancy that reopened this
  review is Synchronizer's to close after this re-review concludes.

## Progress and Conclusion

- First pass concluded `COMPLETE` with no material findings. Reopened for
  `.standards/docs/synchronization/guide-20261004T120000Z-1a2b3c4d.md#D-001`:
  the AC-003 row did not record `--to`. Re-review inspected `--to` against
  `parseArgs` and `filterByDate` and reran it; the AC-003 row now covers all
  three options.
- During re-review, F-001 was found in the synchronization record and routed to
  Synchronizer before this review could close.
- Gate: not passed while F-001 is open.
- Next action on return: reassess F-001 against the corrected synchronization
  record; confirm that the guide, documentation record, scope, design, context,
  and source still match the identities above (rerun `npm test` and the guide
  examples if any of them changed); then conclude the gate.
