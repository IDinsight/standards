# contacts-api

Small JSON API for storing contacts in memory.

- `npm start` runs the server on `PORT` (default 3000).
- `POST /contacts` with `{ "name", "email", "phone"? }` creates a contact.
- `GET /contacts/:id` reads one back.

Run the tests with `npm test`.
