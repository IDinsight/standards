<!-- STANDARDS
Artifact: REVIEW
Cycle: guide-20261004T120000Z-1a2b3c4d
ReviewKind: FINAL_DELIVERABLE
-->

# Review Report

`Cycle`: `guide-20261004T120000Z-1a2b3c4d` `ReviewKind`: `FINAL_DELIVERABLE`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- DOCUMENTATION cycle, completion policy NONE; current acceptance set AC-001,
  AC-002, AC-003.
- Scope `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`, design
  `.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`, context
  `.standards/CONTEXT.md`, and documentation record
  `.standards/docs/documentation/guide-20261004T120000Z-1a2b3c4d.md` (blob
  ${BLOB:.standards/docs/documentation/guide-20261004T120000Z-1a2b3c4d.md}),
  all at ${COMMIT:Document JSON output in usage guide}.
- Saved guide `docs/usage.md`, blob ${BLOB:docs/usage.md}; working tree clean.
- Behavior sources inspected: `bin/csvsum.js`, `src/parse.js`,
  `src/summarize.js`, `docs/examples/`, and `package.json`. Unit tests in
  `test/` were read as support only; no formal implementation verification
  exists for this cycle or is claimed.
- Project references loaded: NONE.
- Session: a chat separate from the authoring conversations; the authoring
  models are not known.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence                                                      | Current disposition              |
| ---------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| AC-001                 | Guide option text vs `parseArgs` options in `bin/csvsum.js`            | Finding: guide names `--sep`     |
| AC-002                 | `npm run docs:check` on the saved guide                                | Finding: delimiter example fails |
| AC-003                 | Empty cells and errors section vs `src/summarize.js`, `bin/csvsum.js` | Supported                        |

## Checks and Results

- `npm run docs:check` in the repository root at
  ${COMMIT:Document JSON output in usage guide}: exit 1,
  `3 example(s) checked, 1 failed`. The failing command is
  `csvsum docs/examples/costs.csv --column cost --sep ';'`, which prints
  `csvsum: Unknown option '--sep'` and a usage line instead of the summary.
- Inspection of `bin/csvsum.js`: the options are `--column`/`-c`,
  `--delimiter` (default `,`), and `--format`.
- The documentation record's hand checks cover the Basic use and JSON output
  examples only.

## Findings

### F-001 — Guide documents a delimiter option csvsum does not accept

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Documenter` `FailureType`:
`DOCUMENTATION`

- **Reference:** `docs/usage.md`, Other delimiters, at the blob above; AC-001,
  AC-002.
- **Failure case:** `csvsum docs/examples/costs.csv --column cost --sep ';'`
  exits with status 2 and `Unknown option '--sep'`.
- **Impact:** readers with semicolon-separated files get an error when they
  follow the guide.
- **Evidence:** the `npm run docs:check` result above; `bin/csvsum.js` defines
  only `--delimiter`.
- **Smallest correction:** document `--delimiter` in the prose and the example,
  keeping the shown output.

## Questions, Limitations, and Later Dependencies

NONE.

## Progress and Conclusion

- All three acceptance conditions were assessed. The gate does not pass while
  F-001 is open.
- Routed to Documenter as a DOCUMENTATION failure. After the correction,
  re-review the guide and rerun the example check.
