# accounts-service

Account support endpoints for the customer portal. Currently handles
password-reset requests.

- `npm start` starts the HTTP server (port from `PORT`, default 3000).
- `npm test` runs the unit tests.

## Endpoints

- `POST /password-reset` with `{ "userId": 7, "email": "a@example.org" }`
  issues a one-hour reset code and emails it. Responds 202, or 400 when a
  field is missing.
