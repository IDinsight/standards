# Project Context

## Project Baseline

- TallyHub: expense tracking for small teams. One repository holds three
  separately released components: the JSON API (`api/`), the static web app
  (`web/`), and the nightly report worker (`worker/`).
- Audited at the start of cycle
  `replace-session-cookie-authentication-20260923T141022Z-5b8e2f17`; the
  repository has no prior design documents for authentication.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`).
- No runtime or development npm dependencies; only Node.js built-in modules
  (`node:crypto`, `node:http`, `node:fs`, `node:test`).
- The web app is plain ES modules loaded by the browser; no bundler.

## Structure and Boundaries

- `api/src/app.js` — request handling as a pure `handle({ method, path,
  headers, body })` function returning `{ status, headers, body }`; route
  table with per-route allowed roles.
- `api/src/auth.js` — session cookie issue/clear, `authenticate` (signed
  cookie -> session, renews expiry), CSRF check, role check.
- `api/src/sessions.js` — `SessionStore` with sliding expiry; memory backend
  for tests, `FileSessionBackend` (`SESSION_FILE`, default
  `var/sessions.json`) in production.
- `api/src/server.js` — `node:http` adapter, JSON body parsing, CORS with
  credentials for `WEB_ORIGIN`.
- `api/src/users.js`, `api/src/ratelimit.js`, `api/src/audit.js` — user
  directory (scrypt hashes), login limiter, audit log.
- `shared/cookies.js`, `shared/signing.js` — cookie parse/serialize and HMAC
  sign/unsign used by the API.
- `web/src/api-client.js` — the only place the browser talks to the API.
- `worker/src/api-session.js` — the only place the worker authenticates to
  the API; `worker/src/report-job.js` builds the monthly report.

## Commands

- `npm test` — runs `node --test` on the five test files under `test/`.
- `npm run start:api` — starts the API (needs `USERS_FILE`).
- `npm run worker` — runs one report job against `API_URL`.

## Conventions and Constraints

- Only Node.js built-in modules may be used at runtime.
- Configuration comes from environment variables read in
  `api/src/config.js` (API) and `worker/src/main.js` (worker).
- Error responses are JSON `{ "error": "<message>" }`.
- The API, web app, and worker deploy on separate schedules; at any time
  production may run different versions of each.

## External Systems and Data

- Production hosts: web app at `app.tallyhub.example`, API at
  `api.tallyhub.example`; `COOKIE_DOMAIN` is `tallyhub.example`, so the
  session cookie is same-site for the web app.
- Session records persist in the session file across API restarts; each
  record holds `userId`, `role`, `csrfToken`, `createdAt`, `expiresAt`.
- The worker uses the `report-worker` service account (role `service`) with
  credentials from `WORKER_USERNAME` / `WORKER_PASSWORD`.

## Testing and Verification Baseline

- `node:test` suites in `test/` exercise the API in process through
  `createApp`, and the web client and worker through the in-process fetch
  adapter in `test/helpers.js` (with a browser-like cookie jar for the web
  client). All tests pass on the current tree.
- Not covered: `api/src/server.js`, `web/src/main.js`, `web/src/login.js`,
  and `worker/src/main.js`; there are no browser tests.

## Relevant Existing Behavior

- `POST /login` verifies credentials, sets `tally_sid` (value is the session
  ID signed with HMAC-SHA256 using `SESSION_SECRET`; HttpOnly, SameSite=Lax,
  Secure unless `SECURE_COOKIES=false`, Max-Age = `SESSION_TTL_SECONDS`,
  default 14 days) and returns `{ user, csrfToken }`.
- Every authenticated request renews the session's expiry by the full TTL.
- Writes (`POST`, `PUT`, `PATCH`, `DELETE`) require `X-CSRF-Token` matching
  the session's token; `GET /me` returns it so a reloaded page can recover it.
- `POST /logout` destroys the session and clears the cookie.
- Route permissions: `member` sees and creates only its own expenses;
  `admin` sees all expenses and reports; `service` may read expenses and
  post reports but not create expenses.
- Login rate limit: 5 failed attempts per username within 15 minutes returns
  429.
- Audit events: `login`, `login.failed`, `logout`, `expense.created`,
  `report.created`.
- The web client sends `credentials: 'include'` on every request and calls
  `onUnauthorized` (redirect to `/login.html`) on a 401.
- The worker signs in on first use, sends the stored cookie and CSRF token,
  and signs in again once when a request returns 401.

## Known Unknowns

- The number of live sessions and the typical session age in production are
  not recorded in the repository; they affect how long old sessions remain in
  circulation but do not block design.

## Evidence

- `api/src/auth.js`, `api/src/sessions.js`, `api/src/app.js` — cookie,
  session, CSRF, and permission behavior.
- `web/src/api-client.js`, `worker/src/api-session.js` — client-side
  authentication behavior.
- `README.md` — components, release model, configuration.
- `npm test` — passes on the audited tree.
