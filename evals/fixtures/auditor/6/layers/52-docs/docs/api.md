# reportdesk API

`createApp({ store, users, secret })` returns a handler that takes
`{ method, path, headers, body }` and returns `{ status, body }`. Errors use
`{ "error": "<message>" }`.

## Sessions

`POST /sessions` with `{ "userId": "...", "password": "..." }` returns `201`
with `{ "token": "...", "expiresAt": <ms> }`, or `401` for wrong credentials.
Send the token as `Authorization: Bearer <token>` on every other request.

Session tokens have the form `<userId>.<expiresAt>.<signature>`. The web
dashboard reads `expiresAt` from the second segment to ask the user to sign in
again before the session ends. Sessions last 30 days, and tokens issued by an
earlier release stay valid until they expire.

## Reports

- `POST /reports` with `{ "title": "...", "rows": [["cell", ...], ...] }`
  creates a report owned by the caller and returns `201` with the report.
- `GET /reports/:id` returns the report if the caller owns it, otherwise `404`.
