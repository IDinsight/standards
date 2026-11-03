<!-- STANDARDS
Artifact: REVIEW
Cycle: export-20260924T090000Z-a7f3c1d2
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `export-20260924T090000Z-a7f3c1d2` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Contract: scope (blob `${BLOB:.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md}`),
  AC-001 and AC-002, no retired identifiers; design revised for streamed
  writes with a time limit (blob `${BLOB:.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md}`);
  context (blob `${BLOB:.standards/CONTEXT.md}`). Cycle mode `STANDARD`.
- Repository: assessed commit
  `${COMMIT:Record export reverification for streamed writes}`, clean working
  tree. Comparison range: `${COMMIT:Record project context for CSV export}`
  (the cycle's first commit; no project code changed in it) to the assessed
  commit.
- Implementation: `src/export.ts` (blob `${BLOB:src/export.ts}`),
  `src/routes/export.ts` (blob `${BLOB:src/routes/export.ts}`), `src/app.ts`
  (blob `${BLOB:src/app.ts}`), `src/http/router.ts`
  (blob `${BLOB:src/http/router.ts}`). Tests: `test/export-write.test.ts`
  (blob `${BLOB:test/export-write.test.ts}`),
  `test/integration/export-flow.test.ts`
  (blob `${BLOB:test/integration/export-flow.test.ts}`).
- Plan (blob `${BLOB:.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md}`)
  `COMPLETE`; verification report
  (blob `${BLOB:.standards/docs/verification/export-20260924T090000Z-a7f3c1d2.md}`)
  `REVERIFY`, `COMPLETE`, `FULL`.
- Excluded: record store, `parseFilter`, auth helpers (unchanged).
- Session: separate chat from the authoring conversations; the client exposes
  no session or model metadata, so neither is certified.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| AC-001 / CSV format and quoting | `test/export.test.ts`; Tester E1 | Supported |
| AC-001 / rows equal `GET /records` | integration exports; inspection of both handlers | Supported |
| AC-001 / 201, headers, body equal to file | integration owner export | Supported |
| AC-001 / time limit: 503, no file, stream destroyed; no stream or timer left after any outcome | timeout test; integration 503 test; R1, R2 | Finding: F-001, F-002 |
| AC-002 / denied before any folder or file | integration denied test; handler order | Supported |

## Checks and Results

- R1: in the project root at the assessed commit:
  `node --input-type=module -e "import { Writable } from 'node:stream'; import { writeExport } from './src/export.ts'; const s = new Writable({ write() {} }); const r = await writeExport('/tmp/review-stall', [], new Date(), { timeoutMs: 20, open: () => s }); console.log(r.timedOut, s.destroyed, s.writableFinished);"`
  printed `true false false`, exit 0.
- R2: `node --test test/export-write.test.ts`: exit 0, 2 passed; the process
  stayed alive about one second after the last test, the 1000 ms limit of the
  first test.
- R3: `pnpm --filter export test` and `pnpm --filter export test:integration`:
  exit 0, 23 and 4 passed; they do not observe stream or timer state.

## Findings

### F-001 — Time-limit timer is never cleared after an export settles

`Severity`: `P2` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/export.ts`, `expiry` and `writeExport`
  (blob `${BLOB:src/export.ts}`); design, Export write; AC-001.
- **Failure case:** any export that finishes before the limit; the timer
  stays pending for the full limit (15 s by default).
- **Impact:** timers accumulate under repeated exports and delay shutdown;
  the design requires no pending timer.
- **Evidence:** R2 and inspection.
- **Smallest correction:** clear the timer whenever `writeExport` settles.

### F-002 — Export stream left open when the time limit expires

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/export.ts`, `writeExport`, the timeout outcome of
  `Promise.race` (blob `${BLOB:src/export.ts}`); design, Export write; AC-001.
- **Failure case:** the export volume stalls (an `open` stream whose writes
  never complete) and `timeoutMs` elapses. `writeExport` returns
  `timedOut: true` and the route answers 503, but the stream is neither
  destroyed nor finished (end() was called but the stalled write never
  completes); with `fs.createWriteStream` its file descriptor stays
  open and buffered rows stay in memory.
- **Impact:** each timed-out export leaks an open file; on a stalled volume,
  repeated exports exhaust file descriptors.
- **Evidence:** R1. The test "writeExport reports a timeout when the volume
  stalls" asserts only `timedOut` and elapsed time.
- **Smallest correction:** destroy the stream on the timeout path before
  `writeExport` returns.

## Questions, Limitations, and Later Dependencies

- The verification report marks the time-limit criterion verified, but its
  cited tests do not observe stream or timer state; reassess with the
  corrected implementation.
- Later dependencies: NONE. Blocking user questions: NONE.

## Progress and Conclusion

- Gate does not pass: F-001 (P2) and F-002 (P1) are open and owned by
  Developer; an `IMPLEMENTATION` failure was routed to `DEVELOPING`.
- Next action on resume: reconcile changed inputs, reassess each open finding
  on the current content, and re-evaluate the gate.
- Summary: the export works and only administrators can use it, but a stalled
  export folder leaves the file open after the time limit, and every export
  leaves a timer running. Developer needs to fix both.
