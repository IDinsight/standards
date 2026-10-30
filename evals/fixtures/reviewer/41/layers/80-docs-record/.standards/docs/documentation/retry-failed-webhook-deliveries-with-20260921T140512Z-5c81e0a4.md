<!-- STANDARDS
Artifact: DOCUMENTATION
Cycle: retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4
-->

# Documentation Record

`Cycle`: `retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4` `Status`: `COMPLETE`
`Collaboration`: `AUTONOMOUS` `Target`: `ACTIVE_CHANGE` `Target Detail`:
`active cycle` `User Style`: `NONE`

## Assessed Inputs and Boundary

- Contract: scope `.standards/docs/scope/retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4.md`
  (current AC-001, AC-002, AC-003, AC-004, AC-005; none retired), design
  `.standards/docs/specs/retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4.md`,
  context `.standards/CONTEXT.md`.
- Implementation and evidence at commit `${COMMIT:Record implementation review}`:
  `src/config.js` and `src/deliver.js` (changed this cycle), `src/relay.js` and
  `src/http.js` (unchanged); plan
  `.standards/docs/development/retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4.md`
  (COMPLETE); verification
  `.standards/docs/verification/retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4.md`
  (COMPLETE, FULL); implementation review
  `.standards/docs/reviews/retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4/implementation.md`
  (COMPLETE, no material findings, AC-005 left to Documenter).
- Baseline: the documentation as of that commit. Edited content:
  `docs/operations.md`, unstaged, blob `${BLOB:docs/operations.md}`. No other
  project file was changed; this record is new and untracked.
- Editing boundary: `docs/operations.md`. `README.md` already points operators
  to the guide and only lists modules, which did not change.
- Style: none selected.

## Documentation Work and Evidence

- `docs/operations.md`, for operators of the dispatcher service:
  - **Configuration** table: added `RELAY_MAX_ATTEMPTS` (3, minimum 1),
    `RELAY_BACKOFF_MS` (500, minimum 0), and `RELAY_MAX_BACKOFF_MS` (8000,
    minimum 0); the invalid-value example now uses a retry setting. Covers
    AC-004 and the settings part of AC-005. Source: `DEFAULTS`, `readInt()`,
    and `loadConfig()` in `src/config.js`.
  - New **Delivery retries** section: retried failures (5xx, 429, no answer)
    and final ones (other 4xx), the doubling wait capped at the maximum, a
    defaults example (3 attempts, waits of 500 ms and 1000 ms), and turning
    retries off with `RELAY_MAX_ATTEMPTS=1`. Describes AC-001, AC-002, and
    AC-003 and satisfies AC-005. Source: `isRetryable()`, `backoffDelay()`, and
    the loop in `deliver()` in `src/deliver.js`; design Interfaces and
    Contracts.
  - **Logs**: replaced the statement that `attempts` is always 1 with its
    meaning under retries. Source: the log line in `src/relay.js` and the
    `attempts` field returned by `deliver()`.
- No other documentation is affected.

## Checks and Applicability

- Inspection: every default, minimum, retried status, and the wait rule in the
  guide compared with `src/config.js` and `src/deliver.js` at the commit
  above; all match. The defaults example was recomputed from `backoffDelay()`
  (500, then 1000).
- `npm test` in the project root on the commit above plus the unstaged guide:
  exit 0; tests 12, pass 12. This supports that the described behavior is the
  tested behavior; it does not test the guide itself.
- Rendered Markdown was not previewed; table syntax checked by inspection.

## Discrepancies, Dependencies, and Remaining Work

NONE.

## Resume and Conclusion

- Target and full Documenter gate complete for the current inputs. AC-005 now
  has documentation evidence (above); AC-001, AC-002, AC-003, and AC-004 are
  documented consistently with the verified behavior.
- Blocking question: NONE.
- Handoff: forward to REVIEWING_FINAL; see `.standards/STATE.md`.
