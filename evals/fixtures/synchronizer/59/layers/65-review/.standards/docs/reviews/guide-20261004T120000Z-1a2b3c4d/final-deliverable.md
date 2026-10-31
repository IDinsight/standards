<!-- STANDARDS
Artifact: REVIEW
Cycle: guide-20261004T120000Z-1a2b3c4d
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `guide-20261004T120000Z-1a2b3c4d` `ReviewKind`: `FINAL_DELIVERABLE`
`Status`: `IN_PROGRESS` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `DOCUMENTATION`, completion policy `NONE`; current acceptance set
  AC-001, AC-002, AC-003 from the scope at
  ${COMMIT:Record context, scope, and design for the rates guide}.
- Technical contracts and Auditor context at the same commit.
- Saved documents: `docs/guide.md` and `README.md` at
  ${COMMIT:Add rates CLI user guide}; documentation record at the same commit.
- Synchronization record
  `.standards/docs/synchronization/guide-20261004T120000Z-1a2b3c4d.md`,
  including its corrected AC-002 references.
- Supporting behavior: `src/rates.js`, `bin/rates.js`, `test/rates.test.js` at
  ${COMMIT:Initial rates CLI}, unchanged since. Existing tests are support,
  not formal current-cycle verification.
- Project references loaded: NONE.
- Session separate from the authoring conversations; model identity is not
  visible to this session.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence                                              | Current disposition |
| ---------------------- | -------------------------------------------------------------- | ------------------- |
| AC-001                 | "Getting a quote" vs `bin/rates.js`; `node bin/rates.js 2 regional` | Supported           |
| AC-002                 | "Zones", "How weight is billed" vs `src/rates.js`              | Finding F-002       |
| AC-003                 | "Errors" vs `bin/rates.js`; CLI error runs                     | Supported           |

## Checks and Results

- `node --test test/rates.test.js` in the project root against
  ${COMMIT:Initial rates CLI} source: exit 0, 5 passed.
- `node bin/rates.js 2 regional` printed `11.20`, matching the guide.
- `node bin/rates.js 1.2` printed `6.30`: 1.2 kg is billed as 1.5 kg, not 2 kg.
- `node bin/rates.js 1 lunar` exit 1 with `unknown zone: lunar`;
  `node bin/rates.js` exit 2 with the usage line; `node bin/rates.js 0` exit 1
  with `weight must be positive`.

## Findings

### F-001 — Synchronization record cites the wrong guide section for AC-002

`Severity`: `P2` `Status`: `RESOLVED` `Owner`: `Synchronizer` `FailureType`:
`SYNCHRONIZATION`

- **Reference:** AC-002 entry of the synchronization record.
- **Failure case:** it pointed at "Getting a quote", which carries no zone or
  billing content.
- **Impact:** the reconciliation of AC-002 rested on the wrong evidence.
- **Evidence:** section contents of `docs/guide.md` at
  ${COMMIT:Add rates CLI user guide}.
- **Smallest correction:** cite the sections that carry AC-002.
- **Reassessment:** checked
  `.standards/docs/synchronization/guide-20261004T120000Z-1a2b3c4d.md#D-001`;
  the entry now cites "Zones" and "How weight is billed". Resolved.

### F-002 — Guide misstates billable-weight rounding

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Documenter` `FailureType`:
`DOCUMENTATION`

- **Reference:** `docs/guide.md`, "How weight is billed", at
  ${COMMIT:Add rates CLI user guide}; AC-002.
- **Failure case:** the guide says a 1.2 kg parcel is billed as 2 kg;
  `quote(1.2, 'domestic')` bills 1.5 kg and returns 6.30, not 6.90.
- **Impact:** readers overestimate prices for most parcel weights.
- **Evidence:** `Math.ceil(weightKg * 2) / 2` in `src/rates.js`; the test
  "billable weight rounds up to the next half kilogram"; the CLI run above.
- **Smallest correction:** state that weight rounds up to the next 0.5 kg.
- **Reassessment:** pending the Documenter's correction.

## Questions, Limitations, and Later Dependencies

NONE beyond the open finding.

## Progress and Conclusion

- Assessment paused at F-002, routed to Documenter as a DOCUMENTATION failure.
- Next action on resume: reassess the corrected "How weight is billed" section
  for AC-002, recheck AC-001 and AC-003 against any other guide changes, then
  conclude the final review.
- The gate does not pass while F-002 is open.
