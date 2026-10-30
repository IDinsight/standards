<!-- STANDARDS
Artifact: REVIEW
Cycle: note-20260924T113000Z-c8d2e5f0
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `note-20260924T113000Z-c8d2e5f0` `ReviewKind`: `IMPLEMENTATION`
`Status`: `IN_PROGRESS` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `EXPEDITED`. Contract: `Active Work.Request`, an optional internal
  ticket note that support staff can set and read, using the existing ticket
  field and visibility behavior. `Scope` and `Architecture` are `NONE`, as
  expected for an expedited cycle.
- First pass: ${COMMIT:Add partner role for vendor queues} (last commit before
  the cycle) to ${COMMIT:Add optional internal note to tickets}; working tree
  clean.
- Rerun after the sign-off rework (Recovery Frame 1):
  ${COMMIT:Add optional internal note to tickets} to
  ${COMMIT:Limit internal note length}, and the whole cycle range from
  ${COMMIT:Add partner role for vendor queues}; working tree clean.
- Assessed content at the rerun: `src/tickets.js` ${BLOB:src/tickets.js},
  `src/visibility.js` ${BLOB:src/visibility.js}, `src/serialize.js`
  ${BLOB:src/serialize.js}, `test/tickets.test.js`
  ${BLOB:test/tickets.test.js}, `test/visibility.test.js`
  ${BLOB:test/visibility.test.js}, `docs/access.md` ${BLOB:docs/access.md}.
- Development plan:
  `.standards/docs/development/note-20260924T113000Z-c8d2e5f0.md`, COMPLETE with
  DEV-001 to DEV-003.
- Session: separate chat from the implementation conversation; the authoring
  model's identity is not visible here.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| --- | --- | --- |
| Request: staff can set and clear an optional note | DEV-001 self-check; `test/tickets.test.js`; Reviewer test run | Supported |
| Request: note returned through the existing visibility rules | DEV-002 self-check; inspection of `FIELD_ACCESS`, `EDIT_ACCESS`, `serializeTicket`, `docs/access.md` | Finding F-001 |
| Sign-off rework: notes limited to 500 characters | DEV-003 self-check; `test/tickets.test.js`; Reviewer test run | Supported |

## Checks and Results

- First pass: `node --test test/visibility.test.js test/tickets.test.js` in the
  project root at ${COMMIT:Add optional internal note to tickets}: exit 0, 12
  passed, 0 failed.
- Rerun: same command at ${COMMIT:Limit internal note length}: exit 0, 13
  passed, 0 failed. Reproduces the DEV-003 self-check.
- Inspection of `update`, `normalize`, and `noteText` in `src/tickets.js`: edit
  permission is checked before any change; the note is trimmed, blank input
  becomes `null`, and more than 500 characters throws before the ticket is
  stored.
- Inspection of `FIELD_ACCESS` and `EDIT_ACCESS` in `src/visibility.js` with
  `serializeTicket`: `internalNote` uses `STAFF`, which includes `partner`.

## Findings

### F-001 — Internal notes are readable by partner accounts

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/visibility.js` ${BLOB:src/visibility.js}, the
  `internalNote: STAFF` entries in `FIELD_ACCESS` and `EDIT_ACCESS`; request
  wording "internal note" for "support staff".
- **Failure case:** a ticket whose `internalNote` is set, serialized with
  `serializeTicket(ticket, 'partner')`, includes `internalNote`; a partner can
  also change it through `update`.
- **Impact:** notes written for internal support staff reach agents at external
  vendors (`docs/access.md`, Roles).
- **Evidence:** inspection of `FIELD_ACCESS`, `EDIT_ACCESS`, and
  `serializeTicket`; `STAFF` contains `partner`. No test covers a partner
  viewer or editor of `internalNote`.
- **Smallest correction:** keep `internalNote` out of partner responses and
  edits.

## Questions, Limitations, and Later Dependencies

- Expedited cycle: the evidence is Developer self-checks and Reviewer
  diagnostics; no Tester report exists by design.
- Later dependencies: NONE.

## Progress and Conclusion

- Rerun after the sign-off rework: the 500-character limit is supported, and the
  earlier conclusion for setting and clearing the note still holds (same code
  paths; the re-run tests pass).
- The first-pass "Supported" disposition for visibility no longer holds; F-001
  is open and the gate does not pass.
- Next action: reassess F-001 once the Developer responds.
- Summary: the note length limit works, but internal notes are visible to
  partner accounts at outside vendors. F-001 needs to be addressed before this
  can go back to sign-off.
