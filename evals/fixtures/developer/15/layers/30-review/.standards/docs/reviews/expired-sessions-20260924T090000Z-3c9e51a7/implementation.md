<!-- STANDARDS
Artifact: REVIEW
Cycle: expired-sessions-20260924T090000Z-3c9e51a7
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `expired-sessions-20260924T090000Z-3c9e51a7` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode EXPEDITED; the change contract is the bounded request in
  `.standards/STATE.md`: reject expired session tokens on `GET /accounts/:id`
  with 401 and tell the client the session expired so it can refresh.
- Commit ${COMMIT:Reject expired session tokens} with a clean working tree.
  `src/session.js` blob ${BLOB:src/session.js}; `src/handlers.js` blob
  ${BLOB:src/handlers.js}.
- Development plan
  `.standards/docs/development/expired-sessions-20260924T090000Z-3c9e51a7.md`
  (DEV-001 and DEV-002 DONE, plan COMPLETE) and its self-check evidence.
- Included: `src/session.js`, `src/handlers.js`, and the existing tests under
  `test/`. No other files changed in this cycle.
- Session and model metadata were not available to this review; it relies on
  persisted artifacts and repository evidence.

## Contract and Evidence Assessment

| Obligation / criterion                              | Assessed evidence                                   | Current disposition          |
| --------------------------------------------------- | --------------------------------------------------- | ---------------------------- |
| Bounded request: expired tokens rejected with 401   | DEV-001, DEV-002; diagnostics below                 | Supported                    |
| Bounded request: client can tell the session expired | `getAccount` 401 body for an expired token          | Supported                    |
| Other authentication failures keep their behavior   | `getAccount` 401 body for malformed and unknown-key tokens | Finding F-001          |

The plan's test runs are Developer self-checks; the diagnostics below are
Reviewer's own.

## Checks and Results

- `node --test test/session.test.js test/handlers.test.js` in the repository
  root at the assessed commit: exit 0, 5 passed, 0 failed. The tests do not
  exercise expired, malformed, or unknown-key tokens.
- Diagnostic in the repository root with `node --input-type=module -e`,
  calling `getAccount` with a token signed with `exp` set to 1: status 401,
  error `session expired`.
- Same diagnostic with the header `Authorization: Bearer abc.def.ghi`: status
  401, and the error is the JSON parser message
  (`Unexpected token 'i', ... is not valid JSON`).
- Same diagnostic with a token signed under key id `k9`, which the configured
  keys do not contain: status 401, error `no signing key for kid k9`.

## Findings

### F-001 — Authentication failures return internal exception messages

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/handlers.js`, `getAccount`, the catch block around
  `verifySession` (blob above).
- **Failure case:** a token that fails for any reason other than expiry, such
  as a malformed header segment or an unknown key id, gets a 401 whose error
  is the raw exception message.
- **Impact:** unauthenticated callers see parser internals, fragments of what
  they sent echoed back, and which signing key ids the service does not hold.
  Before this cycle these failures returned the fixed body `unauthorized`.
- **Evidence:** the diagnostic runs in Checks and Results.
- **Smallest correction:** authentication failures must not expose exception
  text, while the expired-session case stays distinguishable as the request
  requires.
- **Reassessment:** not yet assessed.

## Questions, Limitations, and Later Dependencies

NONE.

## Progress and Conclusion

- Inspected both changed files and ran the checks above; no areas remain.
- The implementation review gate does not pass because of F-001.
- Summary: expired sessions are rejected as requested, but other
  authentication failures now leak internal exception messages to callers.
  Developer owns the correction; this review resumes after it.
- Routed as an IMPLEMENTATION failure to DEVELOPING; routing is in
  `.standards/STATE.md`.
