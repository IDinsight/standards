<!-- STANDARDS
Artifact: REVIEW
Cycle: export-the-client-list-as-csv-20260922T141000Z-5c8e2a91
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `export-the-client-list-as-csv-20260922T141000Z-5c8e2a91` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- EXPEDITED cycle; the change contract is the bounded request `Export the
  client list as CSV.` No scope or design exists on this path.
- Commit ${COMMIT:Add client CSV export endpoint}: `src/csv.js` (new),
  `src/routes/clients.js`, `src/router.js`; working tree clean.
- Development plan
  `.standards/docs/development/export-the-client-list-as-csv-20260922T141000Z-5c8e2a91.md`
  (DEV-001, DEV-002 and their self-check evidence).
- Unchanged boundaries inspected: `src/auth.js` (`requireSignedIn`,
  `requireAdmin`) and the `ForbiddenError` mapping in `src/router.js`.
- Session and model metadata were not available to this review; stated as a
  limitation, not a blocker.

## Contract and Evidence Assessment

| Obligation / criterion                        | Assessed evidence                                      | Current disposition |
| --------------------------------------------- | ------------------------------------------------------ | ------------------- |
| Bounded request: CSV of the client list       | `src/csv.js`, `exportClients`; DEV-001/DEV-002 checks | Supported           |
| Access to exported client contact data        | Reviewer diagnostic call of `handle` (below)          | Finding F-001       |

## Checks and Results

- `npm test` in the project root at the commit above: exit 0, 5 passed. The
  suite does not exercise `GET /clients/export`.
- `node --input-type=module -e` call of `handle` for `GET /clients/export` with
  `actor: null` and two seeded clients: status 200 and a CSV body containing
  both clients' email and phone. Same result with a `member` actor.
- Inspection of `exportClients`: the handler destructures only `store` and
  calls no check from `src/auth.js`, unlike every other client route.

## Findings

### F-001 — Export endpoint has no authorization

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `exportClients` in `src/routes/clients.js` and the
  `GET /clients/export` route in `src/router.js` at the commit above.
- **Failure case:** a signed-out request to `GET /clients/export` returns 200
  with the full active client list.
- **Impact:** every client's email and phone number can be downloaded without
  signing in.
- **Evidence:** the diagnostic call above; `listClients` and `getClient` call
  `requireSignedIn`, `deleteClient` calls `requireAdmin`, the export calls
  neither.
- **Smallest correction:** enforce authorization in the export handler before
  the store is read so the router's `ForbiddenError` mapping returns 403. The
  request does not say which role may download contact data in bulk.
- **Reassessment:** not yet reassessed.

## Questions, Limitations, and Later Dependencies

- Which role may download the client list is not set by the bounded request;
  the correction depends on that decision.

## Progress and Conclusion

- The implementation review gate does not pass: F-001 is open. Routed as an
  `IMPLEMENTATION` failure to Developer.
- Plain summary: the CSV output is correct, but anyone can download it,
  including signed-out users. Developer fixes it; the allowed role still needs
  to be decided.
