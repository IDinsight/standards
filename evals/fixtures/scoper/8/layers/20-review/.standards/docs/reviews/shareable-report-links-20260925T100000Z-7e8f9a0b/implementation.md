<!-- STANDARDS
Artifact: REVIEW
Cycle: shareable-report-links-20260925T100000Z-7e8f9a0b
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `shareable-report-links-20260925T100000Z-7e8f9a0b` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `EXPEDITED`; the bounded request is `Add shareable report links.`
  Scope and architecture are `NONE`, as the expedited path allows.
- Assessed revision `${COMMIT:Add shareable report links}` with a clean working
  tree.
- Development plan
  `.standards/docs/development/shareable-report-links-20260925T100000Z-7e8f9a0b.md`
  (`COMPLETE`; DEV-001 and DEV-002 `DONE`).
- Changed code: `src/shares.js` (new), `src/routes.js`, `src/store.js`.
  Unchanged boundaries read: `src/access.js`, `src/reports.js`, `src/server.js`.
- No `.standards/CONTEXT.md` existed for this project; the existing access rule
  was read from the code and its tests.
- Session and model metadata were not visible to this review; no freshness
  attestation is made.

## Contract and Evidence Assessment

| Obligation / criterion | Assessed evidence | Current disposition |
| ---------------------- | ----------------- | ------------------- |
| Bounded request: a user can create a share link for a report | DEV-001 and DEV-002 self-checks; inspection of `src/shares.js` and `src/routes.js`; ad hoc run below | Works as implemented |
| Bounded request: who may open a shared report | Inspection of `GET /s/:token`; ad hoc run below | Finding F-001 |
| Existing team access rule on report routes | Test run below; inspection of `src/routes.js` | Kept for `/reports` routes; not applied through `/s/:token` (F-001) |

## Checks and Results

- `node --test test/reports.test.js test/access.test.js` in the project root on
  `${COMMIT:Add shareable report links}`: exit 0, 10 passed, 0 failed. Covers
  the existing routes and `canView`/`canEdit`; no test exercises share links.
- Ad hoc `node --input-type=module` script on the same revision: as `ada` (team
  `ops`) created a link for an `ops` report (201), then opened the URL with no
  user (200, full report body) and as `bo` from team `sales` (200, full report
  body).
- Inspection: share records carry no expiry, there is no route to withdraw a
  link, and any user who can read a report can create one.

## Findings

### F-001 — Access policy for opening share links is undecided

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Scoper` `FailureType`: `SCOPING`

- **Reference:** `src/routes.js` (`GET /s/:token`) and `src/shares.js`
  (`resolveShareLink`) at `${COMMIT:Add shareable report links}`; bounded
  request.
- **Failure case:** anyone holding a link URL, signed in or not and from any
  team, receives the full report. The link never expires and cannot be
  withdrawn.
- **Impact:** reports are otherwise readable only by the owning team and
  admins. Whether share links should widen that, to whom, and for how long
  decides what the feature must do; the request does not say, so the
  implementation cannot be judged against it.
- **Evidence:** ad hoc run and inspection under Checks and Results.
- **Smallest correction:** a scoped decision on who may open a shared report and
  whether links expire or can be revoked. This is product scope that neither
  Developer nor Reviewer may decide, and Scoping is not part of the expedited
  topology.
- **Reassessment:** not yet; re-review once the standard cycle has a scope.

## Questions, Limitations, and Later Dependencies

- The share-link access policy is a product decision; it is recorded as F-001
  for Scoper rather than asked here, because the cycle is being promoted.
- No project context existed; the existing access rule was established from
  `src/access.js` and its tests.

## Progress and Conclusion

- All changed files and the routes they touch were inspected; the checks above
  were run.
- The gate does not pass: F-001 is open.
- Summary: the code works as written, but what it should allow is undecided.
  The cycle needs formal Scoping, so it is promoted to `STANDARD` under
  Expedited Promotion and restarts at Auditing. This review is reopened when
  the standard topology reaches implementation review.
