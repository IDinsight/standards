<!-- STANDARDS
Artifact: REVIEW
Cycle: guide-20261004T120000Z-1a2b3c4d
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `guide-20261004T120000Z-1a2b3c4d` `ReviewKind`: `FINAL_DELIVERABLE`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode DOCUMENTATION, completion policy NONE; current acceptance set
  AC-001, AC-002, AC-003 from `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`.
- Deliverable: `docs/guides/convert.md` at ${COMMIT:Add convert command guide}
  (blob ${BLOB:docs/guides/convert.md}); working tree clean at assessment.
- Documentation record
  `.standards/docs/documentation/guide-20261004T120000Z-1a2b3c4d.md` at the same
  commit; scope, design, and Auditor context at
  ${COMMIT:Record context, scope, and design for convert guide}.
- Behavior sources `bin/rowtool.js`, `src/convert.js`, `src/csv.js` at
  ${COMMIT:Initial rowtool CLI}; existing tests used as support only.
- Project references loaded: NONE.
- Assessed in a chat separate from the documentation work; the authoring model
  is not known.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence                                              | Current disposition |
| ---------------------- | -------------------------------------------------------------- | ------------------- |
| AC-001                 | Usage section against `USAGE` and `parseArgs`; error run       | Supported           |
| AC-002                 | Output section against `main` in `bin/rowtool.js`; default run | Finding F-001       |
| AC-003                 | Mapping section and example against `src/convert.js`; rerun    | Supported           |

## Checks and Results

- `node bin/rowtool.js convert examples/ledger.csv` in the project root (Node
  22): exit 0; JSON printed to standard output; no `examples/ledger.json` was
  created.
- Reran the guide's example input with `--out /tmp/example.json`: output matched
  the guide's example.
- `node bin/rowtool.js convert examples/ledger.csv --delimiter`: exit 2,
  `missing value for --delimiter` and usage on standard error, as the Errors
  section says.
- The documentation record's own checks all used `--out`, so they never
  exercised the default destination.

## Findings

### F-001 — Guide states the wrong default output destination

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Documenter` `FailureType`:
`DOCUMENTATION`

- **Reference:** `docs/guides/convert.md`, Output section, first paragraph;
  AC-002.
- **Failure case:** `rowtool convert ledger.csv` without `--out`. The guide says
  it creates `ledger.json`; the command prints the JSON to standard output and
  creates no file.
- **Impact:** Readers following the guide look for a file that never appears and
  lose the output.
- **Evidence:** `main` in `bin/rowtool.js` writes to `process.stdout` unless
  `options.out` is set; the default run above created no file.
- **Smallest correction:** State that output goes to standard output by default
  and that `--out` writes (and overwrites) the named file instead, then recheck
  the section.

## Questions, Limitations, and Later Dependencies

NONE. There are no CLI-level tests; the destination was established by source
inspection and a direct run, which is sufficient for this finding.

## Progress and Conclusion

- All guide sections inspected. The final-deliverable gate does not pass while
  F-001 is open.
- Routed to Documenter as a DOCUMENTATION failure. On return, reassess AC-002
  against the corrected guide and recheck that the rest of the guide is
  unchanged or still accurate.
