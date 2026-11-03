# Records service runbook

Operational notes for the records service behind the internal records admin
tool. For request and response formats, see the usage guide in
`docs/usage.md`.

## How it runs

- The service is a library, not a standalone server. At start-up, the admin
  tool's host process calls `createApp()` from `src/app.ts` and then passes
  each request to `handle()`. Restarting the host restarts the service.
- Node 22 is required. TypeScript runs through Node's type stripping, so
  there is no build artifact; the host loads the sources from the repository
  checkout.
- Install dependencies with `pnpm install` from the committed lockfile. The
  only dependency is the workspace package `@records/seed`.

## Data and storage

- Records are held in memory and loaded from `@records/seed` every time the
  host starts. Changes made while the host runs are lost on restart.
- The service writes nothing to disk. There are no data files to back up,
  rotate, or clean up, and the host does not need a writable directory for
  it.

## Health check

On a freshly started host, `GET /records` as any signed-in role returns `200`
with `"count": 6`. A lower count right after start-up means the seed package
was not installed with the checkout.

## Access

- Every route checks the user's role on the server. Viewers, editors, and
  admins can list records.
- Requests without a signed-in user get `401`; a role that a route does not
  allow gets `403`.
- Users and roles come from the admin tool's sign-in. This service stores no
  users.

## Troubleshooting

| Symptom                    | Likely cause                                   | What to do                                          |
| -------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `401` on every request     | The host is not attaching the signed-in user   | Check the admin tool's session handling             |
| `400 unknown status: ...`  | A client sent a status other than `active` or `archived` | Fix the client's filter                   |
| `404`                      | Unknown path                                   | Compare the path with the routes in `docs/usage.md` |
| `405`                      | Known path, wrong method                       | Check the client's request method                   |
| `500`                      | Unexpected error inside a handler              | Check the host logs; the service does not log itself |

## Escalation

Page the records-admin on-call rotation for anything that blocks the admin
tool. Everything else goes in the team channel during working hours.
