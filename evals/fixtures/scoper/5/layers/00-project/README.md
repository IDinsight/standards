# helpdesk-web

Sign-in and session handling for the support helpdesk web app.

- `npm start` runs the server on `PORT` (default 3000).
- `npm test` runs the tests.

Sessions are kept in memory (`src/sessions.js`); the `sid` cookie is built in
`src/cookies.js`.
