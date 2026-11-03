# helpdesk

In-memory ticket store used by the support desk service.

- `src/tickets.js`: ticket store; creates and updates tickets.
- `src/visibility.js`: which roles may read or change each ticket field.
- `src/serialize.js`: builds the response body for a viewer's role.

Field access rules are described in `docs/access.md`.

Run the tests with `npm test`.
