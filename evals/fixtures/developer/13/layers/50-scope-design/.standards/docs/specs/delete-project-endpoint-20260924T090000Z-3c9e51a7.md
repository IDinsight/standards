<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: delete-project-endpoint-20260924T090000Z-3c9e51a7
-->

# Technical Design

## Context

The single-project route handler `app/api/projects/[id]/route.ts` exports
`GET`. The store in `lib/projects.ts` already provides `deleteProject(id)`,
which returns `true` when a project was removed and `false` otherwise. Errors
are built with `jsonError` from `lib/http.ts`.

## Decision

Add an exported `DELETE` route handler to the existing
`app/api/projects/[id]/route.ts`, next to `GET`. It uses the same handler
signature and the existing store and error helpers. `lib/`, the collection
route, and the UI files are not changed.

## Acceptance Coverage

- `AC-001`: `DELETE` reads the id from the route params and calls
  `deleteProject`. On success it responds 204 with no body. The existing `GET`
  then returns its 404 for that id.
- `AC-002`: when `deleteProject` reports that nothing was removed, `DELETE`
  responds through `jsonError(404, ...)` with the same message format as `GET`.
  The store is otherwise untouched.

## Interfaces and Contracts

- `DELETE /api/projects/[id]` → `204` with an empty body, or `404` with
  `{ "error": "Project <id> not found" }`.
- Handler signature: identical to the file's existing `GET`. The second
  argument carries `params` as a promise, per the pinned Next.js version.

## Technical Acceptance Criteria

- `AC-001`: `deleteProject` is called once with the awaited id. The response
  status is 204 and its body is empty.
- `AC-002`: the 404 response is produced by `jsonError`, and no other project is
  removed.

## Build Plan

1. Add the `DELETE` handler to `app/api/projects/[id]/route.ts`.
