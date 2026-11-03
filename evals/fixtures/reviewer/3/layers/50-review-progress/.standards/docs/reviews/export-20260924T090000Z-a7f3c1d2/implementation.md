<!-- STANDARDS
Artifact: REVIEW
Cycle: export-20260924T090000Z-a7f3c1d2
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `export-20260924T090000Z-a7f3c1d2` `ReviewKind`: `IMPLEMENTATION`
`Status`: `IN_PROGRESS` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `STANDARD`. Scope
  `.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md`
  (blob `${BLOB:.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md}`):
  current acceptance set AC-001 and AC-002; no retired identifiers.
- Technical design `.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md`
  (blob `${BLOB:.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md}`):
  Interfaces and Contracts, Data and Control Flow, Technical Acceptance
  Criteria, and Risks and Follow-up.
- Project context `.standards/CONTEXT.md` (blob `${BLOB:.standards/CONTEXT.md}`).
- Development plan
  `.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md`
  (blob `${BLOB:.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md}`):
  `COMPLETE`, DEV-001 to DEV-003 `DONE`, cadence `AFTER_IMPLEMENTATION`,
  current increment `NONE`.
- Verification report
  `.standards/docs/verification/export-20260924T090000Z-a7f3c1d2.md`
  (blob `${BLOB:.standards/docs/verification/export-20260924T090000Z-a7f3c1d2.md}`):
  `COMPLETE`, purpose `FULL`, target `NONE`; Tester runs E1 and E2 and
  inspection I1 at commit `${COMMIT:Add integration test for denied exports}`.
- Assessed revision: commit `${COMMIT:Record CSV export verification}` with a
  clean working tree (`git status --porcelain` empty, nothing untracked, no
  `exports/` folder). It differs from the Tester's assessed commit only in
  `.standards/STATE.md` and the verification report.
- Comparison range: `${COMMIT:Document listing and filtering records}` (the
  baseline named in the context's Evidence) to the assessed revision. Project
  changes in that range, apart from the STANDARDS installation and this
  cycle's records: `src/export.ts`, `src/routes/export.ts`, `src/app.ts`,
  `package.json`, `.gitignore`, `test/export.test.ts`, and
  `test/integration/export-flow.test.ts`.
- Changed content: `src/export.ts` (blob `${BLOB:src/export.ts}`),
  `src/routes/export.ts` (blob `${BLOB:src/routes/export.ts}`), `src/app.ts`
  (blob `${BLOB:src/app.ts}`), `package.json` (blob `${BLOB:package.json}`),
  `.gitignore` (blob `${BLOB:.gitignore}`), `test/export.test.ts`
  (blob `${BLOB:test/export.test.ts}`), `test/integration/export-flow.test.ts`
  (blob `${BLOB:test/integration/export-flow.test.ts}`).
- Affected unchanged boundaries: `src/auth/authorize.ts`
  (blob `${BLOB:src/auth/authorize.ts}`), `src/records/filter.ts`
  (blob `${BLOB:src/records/filter.ts}`), `src/records/store.ts`
  (blob `${BLOB:src/records/store.ts}`), `src/http/router.ts`
  (blob `${BLOB:src/http/router.ts}`), `src/routes/records.ts`
  (blob `${BLOB:src/routes/records.ts}`).
- Environment: Node 22 and pnpm 10.34.5 in the project root, offline;
  `@records/seed` linked through `workspace:*`; `pnpm-lock.yaml` unchanged in
  the range.
- Included: the export route, serialization, file writing, `createApp`
  options, and the tests and evidence for AC-001 and AC-002. Excluded:
  `GET /records` behavior beyond the shared filter path (unchanged), and
  `README.md` and `docs/usage.md` (documentation phase).
- Session: this assessment runs in a chat that contains only Reviewer work; it
  authored none of the scope, design, context, implementation, tests,
  verification evidence, or documentation. The client exposes no session or
  model metadata, so freshness is stated, not certified, and the model that
  produced the reviewed work is unknown.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| AC-001 / CSV format and RFC 4180 quoting (design: CSV format) | R2; Tester E1 (five serialization tests) and E2 (seed records 1 and 3 quoted in the written file) | Supported |
| AC-001 / exported rows equal `GET /records` for the same query, in id order | R1; Tester E2 and I1 | Supported |
| AC-001 / 201 response, CSV headers, body equal to the CSV | R1; Tester E2 | Supported |
| AC-001 / file location, folder creation, and file write in `writeExport` | Remaining resource cleanup inspection | Not yet assessed |
| AC-002 / no user gets 401, editor or viewer gets 403, no export folder or file is created | R1; C1; Tester E2 (denied-export scenario) | Supported |

Tester E1 and E2 are formal evidence. R1, R2, and C1 are Reviewer
diagnostics. Developer self-checks in the plan are not relied on as evidence.

## Checks and Results

- R1: inspection of `src/routes/export.ts`, `src/auth/authorize.ts`,
  `src/http/router.ts`, and `src/routes/records.ts` at the assessed revision.
  `requireAdmin(request.user)` is the first statement of the
  `POST /records/export` handler; `authorize` throws `HttpError` 401 without a
  user and 403 for a role other than admin; `Router.handle` maps the error to
  its status and `{"error": ...}` body, so `parseFilter`, `store.list`, and
  `writeExport` never run for a denied request. Both routes list records with
  `store.list(parseFilter(request.query))`. The success response is 201 with
  `content-type: text/csv; charset=utf-8`, an attachment
  `content-disposition` naming the file, and the CSV as the body.
  Establishes authorization before any filter, listing, or file-system call;
  does not cover the write path itself.
- R2: inspection of `csvCell` and `toCsv` in `src/export.ts` at the assessed
  revision. The test `/[",\r\n]/` matches comma, double quote, CR, and LF;
  embedded quotes are doubled with `replaceAll('"', '""')`; numbers go
  through `String`; the header comes from the fixed column list
  `id,title,owner,status,createdAt`; every row, including the last, ends with
  CRLF. Matches the design's CSV format.
- C1: diagnostic run in the project root at the assessed revision (clean tree,
  Node 22, offline):

  ```sh
  node -e 'import("./src/app.ts").then(({ createApp }) => { const fs = require("node:fs"); const os = require("node:os"); const path = require("node:path"); const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "review-")), "out"); const app = createApp({ exportDir: dir }); const send = (role) => app.handle({ method: "POST", path: "/records/export", query: { status: "deleted" }, user: { id: 9, name: "Rae", role } }).status; console.log(JSON.stringify([send("viewer"), send("admin"), fs.existsSync(dir)])); })'
  ```

  Result: exit 0, output `[403,400,false]`. With an invalid status, a viewer
  gets 403 (authorization runs before filter validation), an administrator
  gets 400 from `parseFilter`, and the export folder is not created in either
  case. Limit: the probe leaves its empty temporary parent folder in the OS
  temporary directory; nothing in the project changed.
- Reused Tester evidence: E1 (`pnpm --filter export test`, 21 passed) and E2
  (`pnpm --filter export test:integration`, 3 passed) from the verification
  report. They remain applicable because the implementation, test,
  dependency, and configuration content they ran against is identical to the
  assessed revision listed above.

## Findings

No material findings established so far. The remaining area below has not
been inspected, so this is not a passing conclusion.

## Questions, Limitations, and Later Dependencies

- Material gap until done: the resource cleanup inspection has not been
  performed (see Progress and Conclusion). Consequence: this gate cannot pass
  yet. Owner: Reviewer.
- Non-material: two exports in the same second sharing a file name, and the
  absence of export file retention, are accepted risks in the design's Risks
  and Follow-up; they are assessed only for consistency with the design.
- Later dependencies: NONE.
- Blocking user question: NONE.

## Progress and Conclusion

- Completed: R1, R2, C1, and the applicability check of Tester E1 and E2;
  dispositions above.
- Remaining: resource cleanup inspection. (1) `writeExport` in
  `src/export.ts`: folder creation and write order, what happens when creating
  the folder or writing the file fails, and whether a failed request leaves a
  partial file or folder behind. (2) Temporary folder cleanup in
  `test/integration/export-flow.test.ts`. (3) Whether any request path leaves
  files or open handles beyond the design's accepted retention.
- Next action on resume: compare current content with the identities above;
  if unchanged, keep R1, R2, C1, and the Tester evidence, perform the
  remaining inspection, update the file-write row, and decide the gate.
- Gate: not decided; the review is in progress.
- Summary: so far the export only lets administrators through and writes
  correctly quoted CSV. The review cannot move forward until the check of how
  export files and folders are created and cleaned up is done.
