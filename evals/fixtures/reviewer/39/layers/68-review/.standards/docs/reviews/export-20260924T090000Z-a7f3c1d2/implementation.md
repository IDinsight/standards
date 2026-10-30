<!-- STANDARDS
Artifact: REVIEW
Cycle: export-20260924T090000Z-a7f3c1d2
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `export-20260924T090000Z-a7f3c1d2` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- STANDARD cycle. Current acceptance set AC-001, AC-002, AC-003 from the scope
  (blob `${BLOB:.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md}`);
  design (blob `${BLOB:.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md}`),
  including its technical acceptance criteria; context
  (blob `${BLOB:.standards/CONTEXT.md}`).
- Baseline: `${COMMIT:Add CSV import and export over a shared transfer helper}`,
  the last project commit before this cycle. Assessed revision:
  `${COMMIT:Record export timeout verification}` with a clean tree (nothing
  staged, unstaged, or untracked).
- Active change: `src/io/transfer.js` (blob `${BLOB:src/io/transfer.js}`),
  `src/export.js` (blob `${BLOB:src/export.js}`), `test/timeout.test.js`
  (blob `${BLOB:test/timeout.test.js}`), and the `package.json` test script.
  Affected unchanged boundary: `src/import.js`, which calls the same
  `transfer`. `src/csv.js` and `src/store.js` are unchanged.
- Development plan (blob `${BLOB:.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md}`)
  and verification report
  (blob `${BLOB:.standards/docs/verification/export-20260924T090000Z-a7f3c1d2.md}`).
- Session: separate from the authoring conversations. Model metadata is not
  available, so no author-model comparison is recorded.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| AC-001 / timeout error at about the timeout; caller-set, 30-second default | `test/timeout.test.js`; verification E1, I1; R1 | Supported |
| AC-001 / both streams destroyed on timeout; timer cleared on settle | Inspection of `transfer`; diagnostic R2 | Finding F-002 |
| AC-002 / identical CSV | `test/export.test.js`; `test/timeout.test.js`; R1 | Supported |
| AC-003 / imports unchanged, no time limit | `test/import.test.js`; inspection of `src/import.js`; R1 | Supported (F-001 withdrawn) |

## Checks and Results

- R1: `npm test` in the project root at the assessed revision (Node 22,
  offline): exit 0; tests 13, pass 13, fail 0.
- R2: diagnostic run from the project root at the assessed revision, a source
  that never ends into a destination that never acknowledges its first write:

```sh
node --input-type=module -e "
import { transfer } from './src/io/transfer.js';
import { Readable, Writable } from 'node:stream';
const source = new Readable({ read() {} });
source.push('id,title,owner\r\n');
const destination = new Writable({ write() {} });
try { await transfer(source, destination, { timeoutMs: 20 }); } catch (error) { console.log(error.name); }
console.log('source.destroyed', source.destroyed, 'destination.destroyed', destination.destroyed);
"
```

  Result: `TransferTimeoutError`, then
  `source.destroyed false destination.destroyed false`; exit 0.
- Inspection of `transfer`: the timeout branch races `pipeline(...)` against
  a timer with `Promise.race`; nothing destroys either stream or stops the
  pipeline when the timer wins.
- The Tester's AC-001 teardown row rests on inspection I1, which covers the
  timer clear but not stream teardown; no test observes it.

## Findings

### F-001 — Imports have no timeout

`Severity`: `P2` `Status`: `WITHDRAWN` `Owner`: `Developer` `FailureType`: `IMPLEMENTATION`

- **Reference:** `src/import.js`, `importRecords` calls `transfer(input, sink)`
  without `timeoutMs`; AC-003.
- **Failure case:** an import from a stalled source waits indefinitely.
- **Impact:** a stalled import hangs its caller.
- **Evidence:** inspection at the assessed revision.
- **Smallest correction:** none required.
- **Reassessment:** withdrawn. The scope lists import timeouts as a non-goal,
  AC-003 requires imports to keep their current behavior, and the design
  keeps `importRecords` without a timeout. Not a defect under the current
  contract.

### F-002 — Timed-out transfers leave both streams open

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`: `IMPLEMENTATION`

- **Reference:** `src/io/transfer.js`, `transfer` timeout branch (blob
  `${BLOB:src/io/transfer.js}`); AC-001 technical criterion that both streams
  are destroyed when the timeout fires.
- **Failure case:** `exportRecords(store, destination, { timeoutMs })` where
  the destination stops acknowledging writes. The promise rejects with
  `TransferTimeoutError`, but the pipeline keeps running and neither stream is
  destroyed. For a file-path destination the write stream and its file
  descriptor stay open, and if the destination recovers, data is still
  written after the caller was told the export failed.
- **Impact:** every timed-out export leaks an open stream and file
  descriptor; callers that retry after timeouts accumulate them, and a
  reported failure can still complete in the background.
- **Evidence:** R2 shows both streams undestroyed after the rejection;
  inspection confirms no teardown in the timeout branch.
- **Smallest correction:** when the timeout fires, tear down the pipeline so
  both streams are destroyed, as the existing error path does, and keep
  clearing the timer when the transfer settles.
- **Reassessment:** pending Developer correction and Tester reverification.

## Questions, Limitations, and Later Dependencies

- Blocking questions: NONE.
- Later dependencies: NONE; no current AC depends on Documenter.
- Limitation: model metadata unavailable (advisory only).

## Progress and Conclusion

- Inspected: contract and design criteria for all three ACs, the transfer,
  export, and import code, all four test files, the plan's self-checks, and
  the verification report; ran R1 and R2.
- Gate does not pass: F-002 is open (P1).
- Routed F-002 to Developer as an IMPLEMENTATION failure; recovery frame 1
  resumes at REVIEWING_IMPLEMENTATION.
- Next action on resumption: compare current inputs with the identities
  above, recheck F-002 against its original failure case (R2) and the shared
  import path, then reassess the full gate.
- Summary: exports now time out, but a timed-out export leaves its files and
  streams open. Developer needs to close them when the timeout fires.
