# records-admin

Records service used by the operations team. Requests go through
`handle(store, user, request)` in `src/routes.js`, which returns
`{ status, headers, body }`.

Run the tests with `npm test`.
