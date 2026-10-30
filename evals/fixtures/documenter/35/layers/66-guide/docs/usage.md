# Using the records API

The records admin tool serves the records API under
`https://records-admin.internal.example/api`; the paths below are relative to
that address. Every request carries the signed-in user: the browser session
inside the admin tool, or a personal API token sent as
`Authorization: Bearer <token>`. Create a token on the admin tool's
**Settings > API tokens** page; it acts with your role.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records.
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

## Exporting records as CSV

`POST /records/export` saves the records that match a set of filters as a CSV
file. Only administrators can export; editors and viewers get `403`.

The export accepts the same `status`, `owner`, and `q` query parameters as
[filtering](#filtering), with the same validation. Any request body is
ignored.

A successful export returns `201` with:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-<time>.csv"`, where
  `<time>` is the UTC time of the export as `YYYYMMDDTHHMMSSZ`, for example
  `records-20260924T090000Z.csv`
- the CSV file as the body

The service also keeps the file in its export folder (`exports/` by default).
Two exports in the same second get the same file name, and the later one
replaces the earlier file.

The CSV is UTF-8 with the header row `id,title,owner,status,createdAt`,
followed by one row per matching record in `id` order. Every row ends with
CRLF. A field that contains a comma, a double quote, or a line break is
enclosed in double quotes, and each double quote inside it is doubled: the
title `Q2 "priority" accounts review` is written as
`"Q2 ""priority"" accounts review"`.

A failed export writes no file:

- no signed-in user: `401` with `{"error": "authentication required"}`
- editor or viewer: `403` with `{"error": "forbidden"}`
- unknown `status`: `400` with `{"error": "unknown status: <value>"}`

### Exporting from the command line

With an administrator's API token in `RECORDS_ADMIN_TOKEN`, this saves marco's
active records to `marco-active.csv`:

```sh
curl -fsS -X POST -H "Authorization: Bearer $RECORDS_ADMIN_TOKEN" \
  -o marco-active.csv \
  "https://records-admin.internal.example/api/records/export?status=active&owner=marco"
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
