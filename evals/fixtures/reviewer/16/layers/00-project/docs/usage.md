# Using the records service

Every request carries the signed-in user. `admin`, `editor`, and `viewer` can
list records; a request without a user gets `401`, a role that is not allowed
gets `403`.

`GET /records` returns `{"count": n, "records": [...]}` ordered by `id`.
Filters: `status` (`active` or `archived`, anything else is `400`), `owner`
(exact), `q` (case-insensitive title text). Errors are `{"error": "..."}`.
