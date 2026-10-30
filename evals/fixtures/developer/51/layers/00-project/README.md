# contacts-api

A small contacts service: a JSON API over an in-memory store and a static
contacts page.

- `npm start` serves the API and the page on `http://localhost:3000/`
  (`PORT` overrides the port).
- `npm test` runs the test suite with `node:test`.

## API

- `GET /contacts`: every contact.
- `GET /contacts/<id>`: one contact, or 404.
- `POST /contacts`: create a contact from `{ "name", "email", "phone"? }`;
  400 when `name` or `email` is missing.
