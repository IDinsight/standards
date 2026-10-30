# records-admin

Backend for the internal records admin tool: an in-memory record store, role
checks, and routes exercised in-process.

    pnpm test

runs `node --test test/*.test.ts` (Node 22 type stripping; no build step, no
dependencies).

- `GET /records`: records filtered by `status` and `owner`. Any signed-in role.
- `POST /records/import`: bulk import from CSV (`title,owner,status,createdAt`).
  Admins and editors. Returns counts and a CSV report of rejected rows.
