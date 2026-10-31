# records-api

Internal records service. Handlers in `src/routes.js` return
`{ status, headers, body }` objects, and `dispatch(method, path, user)` looks a
handler up by method and path.

Access is role based. `config/access.json` maps each permission to the roles
that hold it, and `can(user, permission)` in `src/auth.js` checks it.

Run the tests with `npm test`.
