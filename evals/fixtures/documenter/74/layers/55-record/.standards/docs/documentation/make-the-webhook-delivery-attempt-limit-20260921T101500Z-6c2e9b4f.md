<!-- STANDARDS
Artifact: DOCUMENTATION
Cycle: make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f
-->

# Documentation Record

`Cycle`: `make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f` `Status`: `IN_PROGRESS`
`Collaboration`: `AUTONOMOUS` `Target`: `ACTIVE_CHANGE` `Target Detail`:
`make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f` `User Style`: `NONE`

## Assessed Inputs and Boundary

- Assignment: recovery Frame 1 in `.standards/STATE.md` (owner DOCUMENTING),
  correction of the contributor guidance in `CONTRIBUTING.md`. Workflow
  context: STANDARD cycle, completion policy IMPLEMENTATION_REVIEWED; routing
  stays in `STATE.md`.
- Contract and context, unchanged since
  ${COMMIT:Record project context, scope, and design for webhook retry limit}:
  scope `.standards/docs/scope/make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f.md`
  (AC-001, AC-002, AC-003; no retired identifiers), design
  `.standards/docs/specs/make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f.md`,
  and `.standards/CONTEXT.md`.
- Behavior sources, unchanged since ${COMMIT:Add configurable webhook retry limit}:
  `src/config.js`, `src/delivery.js`, `src/worker.js`. Tests unchanged since
  ${COMMIT:Add retry limit tests and verification report}.
- Owner evidence read as support:
  `.standards/docs/development/make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f.md`,
  `.standards/docs/verification/make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f.md`,
  `.standards/docs/reviews/make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f/implementation.md`.
- Comparison basis: HEAD ${COMMIT:Route CONTRIBUTING.md correction to documentation}.
  Working tree: unstaged edits to `CONTRIBUTING.md` (this correction) and to
  this record; no staged, untracked, moved, or deleted project files.
- `CONTRIBUTING.md` pre-correction content: the HEAD version. Post-correction
  content: the working tree, with a `WEBHOOK_MAX_ATTEMPTS` row added to the
  configuration table and the Retries section rewritten; no other lines
  changed.
- `README.md`: HEAD version, unchanged.
- Editing boundary: project documentation prose only (`CONTRIBUTING.md`,
  `README.md`); no source, tests, or configuration.
- Styles: Documenter `styles/universal.md`; no user style; no technology style
  applied (Markdown prose only).
- Project references loaded: NONE.
- This record's own progress writes are not deliverable inputs.

## Documentation Work and Evidence

- `CONTRIBUTING.md`, sections Running the worker (configuration table) and
  Retries. Audience: contributors running the worker locally. Need: the
  guidance described the fixed five-attempt limit and the `MAX_ATTEMPTS`
  constant this cycle removed, and did not list `WEBHOOK_MAX_ATTEMPTS`.
  Related behavior: AC-001 (default of 3 attempts), AC-002 (1 to 10 accepted),
  AC-003 (other values fail worker creation with an error naming the
  variable). Behavior inspected in `parseMaxAttempts` and `loadConfig`
  (`src/config.js`), the attempt loop in `src/delivery.js`, and `createWorker`
  (`src/worker.js`). Outcome: saved and inspected; the new table row and the
  Retries section match that behavior. Disposition: complete.
- `README.md`. Audience: anyone opening the repository. It names the project,
  points to `CONTRIBUTING.md` for configuration and retries, and gives
  `npm test`; it states nothing about attempt limits. Disposition: no change
  needed (inspected).
- No other project documentation exists (repository file list inspected).

## Checks and Applicability

- Inspection: compared the saved `CONTRIBUTING.md` with `src/config.js` and
  `src/delivery.js`: default 3, accepted range 1 to 10, unset or empty uses the
  default, error message beginning `WEBHOOK_MAX_ATTEMPTS must be a whole number
  from 1 to 10`, waits doubling from `WEBHOOK_BACKOFF_MS`. All statements
  match.
- `node --input-type=module -e "import { loadConfig } from './src/config.js'; console.log(loadConfig({}).maxAttempts, loadConfig({ WEBHOOK_MAX_ATTEMPTS: '10' }).maxAttempts)"`
  in the project root, Node 22: printed `3 10`, exit 0. Confirms the documented
  default and upper bound.
- `node --input-type=module -e "import { createWorker } from './src/worker.js'; createWorker({ send: async () => {}, env: { WEBHOOK_MAX_ATTEMPTS: '0' } })"`
  in the project root: exit 1 with `Error: WEBHOOK_MAX_ATTEMPTS must be a whole
  number from 1 to 10, got "0"`. Confirms the documented startup failure.
- `npm test` in the project root: exit 0, 10 tests passed. Sanity only; no
  tests changed and this is not formal verification.
- The project has no link checker, Markdown lint, or documentation build; the
  table was checked by reading its source.

## Discrepancies, Dependencies, and Remaining Work

### DOC-001 — CONTRIBUTING.md describes the fixed five-attempt limit

`Status`: `RESOLVED` `Owner`: `Documenter`

- Reference: `CONTRIBUTING.md` (HEAD version), configuration table and Retries
  section; AC-001, AC-002, AC-003. Failure type DOCUMENTATION.
- Evidence and impact: it stated that each event is attempted at most 5 times
  and that the limit is the `MAX_ATTEMPTS` constant in `src/delivery.js`. Since
  this cycle the default is 3 and the limit comes from `WEBHOOK_MAX_ATTEMPTS`.
  Contributors following it would expect the wrong retry count and look for
  code that no longer exists.
- Required correction: describe `WEBHOOK_MAX_ATTEMPTS`, its default, range, and
  invalid-value behavior.
- Resolution: corrected in the working tree and verified by the checks above.

No other documentation discrepancy or gap is open.

## Resume and Conclusion

- Next concrete action: recheck the recorded identities against current
  content, run `node .standards/bin/check.mjs`, apply the completion gate, and
  decide the route for recovery Frame 1 from `.standards/STATE.md`.
- Blocking question: NONE.
- Verified owned correction: DOC-001.
- Gate: not yet rechecked; the record stays IN_PROGRESS until then. No handoff
  has been made.
