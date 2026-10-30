<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-workspace-activity-endpoint-20260921T141203Z-5b8e2c71
-->

# Development Plan

`Cycle`: `add-workspace-activity-endpoint-20260921T141203Z-5b8e2c71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Workspace activity newest first at GET /workspaces/:id/activity, at most 50 per page with a ?before= cursor.`

## Build Steps

### DEV-001 — Workspace activity endpoint

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Expose a workspace's activity events, newest first, through a new handler.

**Affected Area**

New `src/routes/activity.js`, reusing `authenticate` (`src/auth.js`), `handle`
(`src/handle.js`), and `findWorkspace` (`src/store.js`).

**Expected Outcome**

`listWorkspaceActivity(store, request)` returns status 200 with the events whose
`workspaceId` matches `request.params.id`, sorted by `at` descending; 401
without a valid bearer token; 404 for an unknown workspace.

**Self-Check**

- `npm test` in the project root: exit 0, 5 passed, 0 failed (existing auth and
  workspace-list tests; behavior unchanged).
- `node --input-type=module -e ...` diagnostic in the project root calling
  `listWorkspaceActivity` with a seeded store of three events across two
  workspaces: 200 with the two matching events newest first; 404 for `w9`; 401
  with no `authorization` header.
- Assessed content: the working tree that became the commit adding the endpoint
  on 2026-09-21; no other project files changed.

### DEV-002 — Page activity results

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Return at most 50 events per call and let callers page back to older events.

**Affected Area**

`src/routes/activity.js` only.

**Expected Outcome**

The response body becomes `{ events, next }`. `events` holds at most 50 events,
newest first, limited to events older than `query.before` when it is given.
`next` is the `at` of the last returned event when 50 were returned, otherwise
`null`. The 401 and 404 responses are unchanged.

**Self-Check**

- `npm test` in the project root: exit 0, 5 passed, 0 failed.
- `node --input-type=module -e ...` diagnostic in the project root with 120
  seeded events one minute apart: following `next` returned pages of 50, 50, and
  20 events, newest first, and the last page had `next` set to `null`; 401 and
  404 unchanged.
- Assessed content: the working tree that became the paging commit on
  2026-09-23; only `src/routes/activity.js` changed among project files.

## Plan Notes

- At sign-off on 2026-09-23 the user requested paging as bounded rework
  (recovery Frame 1). DEV-002 was added for it, including the response shape
  change from an array to `{ events, next }`, and the user approved the revised
  plan before implementation.
