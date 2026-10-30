# TallyHub

Expense tracking for small teams. Three parts share this repository:

- `api/` — JSON API (`npm run start:api`). Holds users, sessions, expenses,
  and monthly reports.
- `web/` — browser app, published as static files (`web/index.html`,
  `web/login.html`, `web/src/`).
- `worker/` — nightly job that builds the monthly expense report through the
  API (`npm run worker`).

The API, web app, and worker are released separately; each has its own deploy
schedule. In production the web app is served from `app.tallyhub.example` and
the API from `api.tallyhub.example`.

## Authentication

Users sign in with `POST /login`. The API sets a signed `tally_sid` session
cookie (HttpOnly, SameSite=Lax, 14 days, renewed on every authenticated
request) and returns a CSRF token that the web app sends as `X-CSRF-Token` on
every write. `POST /logout` ends the session. The worker signs in with the
`report-worker` service account and signs in again when its session expires.

## Configuration

API:

- `PORT` (default `8080`)
- `SESSION_SECRET` — key used to sign session cookies
- `SESSION_TTL_SECONDS` (default 14 days)
- `COOKIE_DOMAIN` — set to `tallyhub.example` in production
- `SECURE_COOKIES` (default `true`)
- `SESSION_FILE` (default `var/sessions.json`)
- `USERS_FILE` (default `var/users.json`)
- `AUDIT_FILE` (default `var/audit.log`)
- `WEB_ORIGIN` — origin allowed by CORS

Worker:

- `API_URL`, `WORKER_USERNAME`, `WORKER_PASSWORD`, `REPORT_PERIOD` (`YYYY-MM`)

## Development

```sh
npm test
```

The project uses only Node.js built-in modules.
