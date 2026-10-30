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
- `Request`: `Add GET /workspaces/:id/activity returning the workspace's activity events, newest first.`

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
