# signup-service

A small HTTP service that accepts newsletter signups.

## Endpoint

`POST /signups` with a JSON body `{ "name": "...", "email": "..." }`.

- `201` with `{ id, name, email }` when the signup is stored.
- `400` with `{ errors: [...] }` when the body is not JSON or fails validation.
- `409` when the email is already registered.

## Running

- `npm start` starts the server on `PORT` (default 3000).
- `npm test` runs the tests.

Signups are kept in memory; restarting the server clears them.
