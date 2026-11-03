<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: delete-project-endpoint-20260924T090000Z-3c9e51a7
-->

# Development Plan

`Cycle`: `delete-project-endpoint-20260924T090000Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/delete-project-endpoint-20260924T090000Z-3c9e51a7.md`
- `Architecture`: `.standards/docs/specs/delete-project-endpoint-20260924T090000Z-3c9e51a7.md`
- `Request`: `Add an endpoint to delete a project by id.`

## Build Steps

### DEV-001 — DELETE handler for a single project

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Expose project deletion through the existing single-project route.

**Affected Area**

`app/api/projects/[id]/route.ts` only. It uses the existing `deleteProject`
from `lib/projects.ts` and `jsonError` from `lib/http.ts`, both unchanged.

**Expected Outcome**

The route file exports `DELETE` alongside `GET`. It responds 204 with an empty
body when the project existed and was removed, and 404 with the standard error
body, in the same message format as `GET`, for an unknown id.

**Self-Check**

Planned: `pnpm test` from the project root; the existing route tests must
still pass. Then a direct call of the new handler for an existing and an
unknown id, inspecting status and body. Not yet run.

---

## Plan Notes

Approved by the user as proposed, with `AUTONOMOUS` mode and no user style.
