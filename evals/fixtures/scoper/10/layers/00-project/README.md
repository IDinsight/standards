# user-directory

Internal staff directory: a user list, a search function, and the handler
behind the `/search?q=` endpoint.

- `src/search.js` — `searchUsers(users, query)`
- `src/directory.js` — `handleSearch(users, params)` returns `{ status, body }`
- `src/users.js` — sample records

Run the tests with `npm test`.
