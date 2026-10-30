<!-- STANDARDS
Artifact: REVIEW
Cycle: add-workspace-activity-endpoint-20260921T141203Z-5b8e2c71
ReviewKind: IMPLEMENTATION
-->

# Review Report

`Cycle`: `add-workspace-activity-endpoint-20260921T141203Z-5b8e2c71` `ReviewKind`: `IMPLEMENTATION`
`Status`: `BLOCKED` `User Style`: `NONE`

## Assessed Inputs and Scope

- Cycle mode `EXPEDITED`; the contract is `Active Work.Request` as revised by
  the bounded rework at sign-off: workspace activity newest first, at most 50
  per page, with a `?before=` cursor.
- Rerun assessment at commit `${COMMIT:Page workspace activity at 50 events}`
  with a clean working tree. The earlier pass assessed
  `${COMMIT:Add workspace activity endpoint}`.
- Development plan
  `.standards/docs/development/add-workspace-activity-endpoint-20260921T141203Z-5b8e2c71.md`
  (DEV-001, DEV-002, and their self-check evidence).
- Included: `src/routes/activity.js` and the helpers it calls (`src/auth.js`,
  `src/handle.js`, `src/store.js`). Excluded: `src/routes/workspaces.js` and the
  existing tests, unchanged by this cycle.
- Session and model identity are not visible to this review; recorded as a
  limitation, not an attestation.

## Contract and Evidence Assessment

| Obligation / criterion                                    | Assessed evidence                | Current disposition |
| --------------------------------------------------------- | -------------------------------- | ------------------- |
| Bounded request: workspace activity newest first          | DEV-001 self-check; diagnostic 1 | Supported           |
| Bounded request: at most 50 per page with `?before=`      | DEV-002 self-check; diagnostic 2 | Supported           |
| Workspace data reaches only callers allowed to see it     | Diagnostic 3                     | Finding F-001       |

Developer self-checks are implementation feedback; the diagnostics below are
Reviewer checks. Tester evidence is not part of an expedited cycle.

## Checks and Results

- `npm test` in the project root at the rerun commit: exit 0, 5 passed. Covers
  only pre-existing auth and workspace-list behavior.
- Diagnostic 1 (`node --input-type=module -e ...`, project root): seeded three
  events in `w1` and one in `w2`; as a member of `w1`, the handler returned 200
  with the three `w1` events newest first.
- Diagnostic 2: seeded 120 events; successive calls following `next` returned
  50, 50, and 20 events, the last with `next` set to `null`.
- Diagnostic 3: user `u2`, who is not the owner, a member, or a guest of `w1`,
  called with `params.id` set to `w1`; the result was 200 with every `w1` event,
  including `invoice.paid` and `member.removed`.

## Findings

### F-001 — Activity endpoint returns any workspace's events to any signed-in user

`Severity`: `P1` `Status`: `OPEN` `Owner`: `Developer` `FailureType`:
`IMPLEMENTATION`

- **Reference:** `src/routes/activity.js`, `listWorkspaceActivity`, at the rerun
  commit. The handler calls `authenticate` and `findWorkspace` but never relates
  the caller to the workspace.
- **Failure case:** a caller with a valid token and no relationship to `w1`
  requests `/workspaces/w1/activity` and receives 200 with the full event list.
- **Impact:** billing and membership activity of every workspace is readable by
  every account.
- **Evidence:** diagnostic 3 above.
- **Smallest correction:** refuse the request unless the caller is allowed to
  read that workspace's activity, without changing the paging behavior.
- **Reassessment:** pending.

## Questions, Limitations, and Later Dependencies

NONE. No automated tests exercise the activity handler; the diagnostics above
are the evidence for this rerun.

## Progress and Conclusion

- The first implementation review passed with no material findings and the
  cycle reached sign-off.
- This rerun was required by recovery Frame 1 after the bounded paging rework.
  The paging change itself is supported; F-001 is new and blocks the gate.
- The gate does not pass. Routed as an `IMPLEMENTATION` failure to Developer
  (recovery Frame 2). On return, recheck F-001, the paging behavior, and the 401
  and 404 paths.
- Summary: the work cannot move to sign-off because any signed-in user can read
  any workspace's activity; Developer owns the fix; the existing suite and three
  diagnostics were run; no automated tests cover the activity handler.
