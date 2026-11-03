<!-- STANDARDS
Artifact: SCOPE
Cycle: delete-project-endpoint-20260924T090000Z-3c9e51a7
-->

# Project Deletion Endpoint

## Goal

API clients can create, list, and read projects, but cannot remove one. Add a
way to delete a single project by id over the existing JSON API.

## Constraints

- Existing endpoints and their response shapes stay unchanged.
- Error responses use the service's standard JSON error body.

## Non-goals

- Soft deletion, archiving, or undo.
- Authentication or authorization changes.
- Any change to the landing page or other UI.

## Work

### 1. Delete a project over HTTP

**Intent:** Let clients remove a project they no longer need without restarting
the service.

**Done when:**

- `AC-001`: `DELETE /api/projects/{id}` for an existing project responds 204
  with an empty body, and a later `GET /api/projects/{id}` for that id responds
  404.
- `AC-002`: `DELETE /api/projects/{id}` for an unknown id responds 404 with the
  standard JSON error body and leaves every existing project unchanged.

**Depends on:** None
