# loginsvc

Password login and in-memory sessions for the internal admin tools.

- `src/login.js`: checks a username and password against scrypt hashes and
  creates a session.
- `src/sessions.js`: session creation and expiry. Sessions last 30 minutes.

Run the tests with `npm test`.
