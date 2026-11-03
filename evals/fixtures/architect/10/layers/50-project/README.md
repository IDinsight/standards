# user-directory

Internal directory of staff accounts with a small JSON search API.

- `npm start` serves `GET /users/search?q=<text>` on `PORT` (default 3000).
- `npm test` runs the unit tests.

Users are loaded from `data/users.json` when the server starts.
