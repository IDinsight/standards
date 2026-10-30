# accounts-api

Small account service built on Node.js built-ins only.

## Routes

- `GET /health` — liveness probe, returns `{ "ok": true }`.
- `POST /users` — register with `{ "username", "password" }`. Usernames are
  case-insensitive; passwords need at least 8 characters. Returns `201` with
  `{ "id", "username" }`, or `400` with `{ "error" }`.

## Development

```sh
npm test          # node --test test/users.test.js test/app.test.js
npm start         # listens on $PORT (default 3000)
```
