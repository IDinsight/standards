# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records.
- A request without a signed-in user gets `401`; a role that is not allowed
  for a route gets `403`. Role checks run on the server in every handler.

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

## Exporting records as CSV

    POST /records/export?status=active&owner=marco

`POST /records/export` takes the same `status`, `owner`, and `q` query
parameters as `GET /records`, with the same validation, and exports exactly
the records `GET /records` lists for that query, in the same order.

Only `admin` users can export. The service checks the role before doing
anything else, so a refused request never creates an export file or the
export folder:

- No signed-in user: `401` with `{"error": "authentication required"}`.
- `editor` or `viewer`: `403` with `{"error": "forbidden"}`, even when the
  query is otherwise invalid.
- An invalid `status` from an administrator: `400`, as when listing, and no
  file is written.

A successful export writes the CSV to `exports/records-<YYYYMMDDTHHMMSSZ>.csv`,
named after the UTC time of the request, and returns `201` with
`content-type: text/csv; charset=utf-8`, a `content-disposition` attachment
header naming the file, and the same CSV as the body. The `exports` folder is
created when it is missing, is relative to the service's working directory
(the `exportDir` option of `createApp` changes it), and is ignored by git.

### CSV format

The first row is the header `id,title,owner,status,createdAt`, followed by one
row per record; every row ends with CRLF. A field containing a comma, a double
quote, or a line break is enclosed in double quotes, with each double quote
inside it doubled (RFC 4180).

## Errors

Errors are JSON objects of the form `{"error": "..."}`:

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 400    | Invalid query parameter                  |
| 401    | No signed-in user                        |
| 403    | Role not allowed for this route          |
| 404    | Unknown path                             |
| 405    | Known path, unsupported method           |
| 500    | Unexpected server error                  |
