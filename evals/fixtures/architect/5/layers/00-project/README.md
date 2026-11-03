# reports

Stores tabular reports per workspace and serves them through a small request
handler (`createRouter` in `src/routes.js`). Callers pass
`{ method, path, headers, body }` and get `{ status, body }` back.

## Routes

- `GET /workspaces/:id/reports` lists a workspace's reports (members only).
- `POST /workspaces/:id/reports` creates a report with a `title` and optional `rows`.
- `GET /reports/:id` returns one report to members of its workspace.

Every request needs an `Authorization: Bearer <token>` header for a valid session.

## Tests

```
npm test
```
