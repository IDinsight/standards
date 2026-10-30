# Migrating between releases

This page lists what operators need to change when the admin tool's host picks
up a new version of the records service, newest release first. The version is
in `package.json`.

## 0.3.0

- `GET /records` accepts the `status`, `owner`, and `q` filters. An unknown
  `status` now returns `400` instead of being ignored. Check any saved links
  or scripts that pass other status values.
- No host changes are needed.

## 0.2.0

- Every request must carry the signed-in user. Requests without one get
  `401`, and a role that a route does not allow gets `403`. Make sure the host
  passes the admin tool's session user as `user` on each request.
- No storage changes; the service still keeps everything in memory.

## 0.1.0

- First release: an in-memory record store seeded from `@records/seed`.
