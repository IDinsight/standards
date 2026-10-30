# relay

Job relay service with a browser front end and a background worker. All three
parts live in this repository and authenticate through one shared session
contract.

## Layout

- `shared/session.js` — the session contract: in-memory `SessionStore`, the
  `sid` cookie name, its 30-day lifetime, and cookie helpers.
- `api/` — request handlers (`routes.js`) and session authentication
  (`auth.js`).
- `web/apiClient.js` — browser client; relies on the `sid` cookie set by
  `POST /login`.
- `worker/apiClient.js` — background worker client; sends a long-lived service
  session from `WORKER_SESSION_ID` as the `sid` cookie.

The API, web app, and worker are deployed separately and do not always release
together.

## Tests

    npm test
