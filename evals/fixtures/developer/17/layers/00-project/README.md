# workspace-api

In-process request handlers for workspaces. Each handler takes a store and a
request-like object `{ headers, params, query }` and returns `{ status, body }`;
the HTTP layer that mounts them lives in another repository.

## Routes

- `GET /me/workspaces` — `listMyWorkspaces`: workspaces the caller is a member of.
- `GET /admin/workspaces` — `listAllWorkspaces`: every workspace (admins only).

Authentication uses a bearer token looked up in the store's users.

## Development

Requires Node 22. Run `npm test`.
