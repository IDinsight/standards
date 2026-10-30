# Using the records API

The records admin tool serves the records API under
`https://records-admin.internal.example/api`; the paths below are relative to
that address. Every request carries the signed-in user: the browser session
inside the admin tool, or a personal API token sent as
`Authorization: Bearer <token>`. Create a token on the admin tool's
**Settings > API tokens** page; it acts with your role.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- A request without a signed-in user gets `401`; a role that is not allowed
  for a route gets `403`. See [Errors](#errors).

## Listing records

`GET /records` returns JSON:

```json
{ "count": 1, "records": [ { "id": 4, "title": "Insurance renewal 2026", "owner": "marco", "status": "active", "createdAt": "2026-04-18T16:20:00Z" } ] }
```

Records are ordered by `id`. Each record has `id`, `title`, `owner`,
`status` (`active` or `archived`), and `createdAt` (ISO 8601, UTC).

## Filtering

Query parameters narrow the list; all given filters must match:

- `status`: `active` or `archived`. Any other value returns `400` with
  `{"error": "unknown status: <value>"}`.
- `owner`: exact owner username, for example `marco`.
- `q`: case-insensitive text that must appear in the title.

Blank values and other parameters are ignored.

Example: `GET /records?status=active&owner=marco` lists marco's active records.

## Calling the API from the command line

With your API token in `RECORDS_ADMIN_TOKEN`:

```sh
curl -fsS -H "Authorization: Bearer $RECORDS_ADMIN_TOKEN" \
  "https://records-admin.internal.example/api/records?status=active&owner=marco"
```

## Errors

Errors are JSON objects of the form `{"error": "..."}`:

| Status | Meaning                         |
| ------ | ------------------------------- |
| 400    | Invalid query parameter         |
| 401    | No signed-in user               |
| 403    | Role not allowed for this route |
| 404    | Unknown path                    |
| 405    | Known path, unsupported method  |
| 500    | Unexpected server error         |
