<!-- STANDARDS
Artifact: REVIEW
Cycle: shareable-report-links-20260925T100000Z-7e8f9a0b
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `shareable-report-links-20260925T100000Z-7e8f9a0b` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `EXPEDITED`; the contract is the bounded `Active Work.Request`
  (read-only share links that open without signing in and expire after 7 days).
- Comparison range: `${COMMIT:Plan shareable report links}` (cycle start, last
  commit before implementation) to `${COMMIT:Add shareable report links}`;
  working tree clean at review time.
- Changed paths: `src/tokens.js`, `src/api.js`, `test/tokens.test.js`,
  `test/shares.test.js`, `package.json`. Unchanged boundary inspected:
  `docs/api.md` (client-facing session contract).
- Development plan
  `.standards/docs/development/shareable-report-links-20260925T100000Z-7e8f9a0b.md`
  at `${COMMIT:Add shareable report links}`; `.standards/CONTEXT.md` read as
  prior evidence only.
- No client metadata about the authoring session or model was available.

## Contract and Evidence Assessment

| Obligation / criterion                               | Assessed evidence                               | Current disposition |
| ---------------------------------------------------- | ----------------------------------------------- | ------------------- |
| Bounded request: owner creates a 7-day share link    | DEV-002; `test/shares.test.js`; route inspection | Supported           |
| Bounded request: shared report opens without sign-in | DEV-002; `test/shares.test.js`                  | Supported           |
| Existing session behavior preserved                  | DEV-001; `docs/api.md` Sessions; reproducer     | Finding F-001       |

## Checks and Results

- `npm test` in the project root at `${COMMIT:Add shareable report links}`:
  exit 0, all four test files passed. Establishes that the new share tests and
  the updated token-format test pass; it does not cover tokens issued before
  the change.
- Reproducer: signed a session token with `signToken` from `src/tokens.js` at
  `${COMMIT:Plan shareable report links}` and passed it to `verifyToken` at
  `${COMMIT:Add shareable report links}` with the same secret: result `null`,
  so the request is answered with `401`.
- Inspection: `docs/api.md` still documents `<userId>.<expiresAt>.<signature>`,
  the dashboard reading `expiresAt` from the second segment, and that tokens
  from an earlier release stay valid until they expire.

## Findings

### F-001 — Session token format change breaks issued sessions

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Architect` `FailureType`:
`ARCHITECTURE`

- **Reference:** `signToken` and `verifyToken` in `src/tokens.js` and
  `authenticate` in `src/api.js` at `${COMMIT:Add shareable report links}`;
  `docs/api.md` Sessions.
- **Failure case:** a session token issued before this change has three
  segments; `verifyToken` now requires four and returns `null`, so every
  signed-in user gets `401` after deployment. New session tokens start with
  `session.`, so the dashboard reads the user id where it expects `expiresAt`.
- **Impact:** forced sign-out of every user holding a 30-day session, and a
  broken documented contract for the web dashboard.
- **Evidence:** reproducer above; `test/tokens.test.js` now asserts the
  four-segment form.
- **Smallest correction:** decide how share tokens coexist with the documented
  session token contract, then implement that decision. Options include a
  separate share-token format, a versioned token layout, or a transition period
  that accepts both layouts. Choosing among them is a consequential technical
  decision with client compatibility impact, which the expedited path does not
  provide.
- **Reassessment:** not yet; reassess against the corrected implementation.

## Questions, Limitations, and Later Dependencies

- The bounded request does not say whether existing sessions or the dashboard
  contract may change. Resolving F-001 needs the standard workflow's Scoper and
  Architect.

## Progress and Conclusion

- The implementation gate does not pass: F-001 is open and its correction
  needs a compatibility decision owned by Architect.
- The cycle was promoted to `STANDARD`; routing is in `.standards/STATE.md`.
- Next action: reassess F-001 and the share routes in a later implementation
  review once the decision is implemented.
