# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records (see Exporting records).
- A request without a signed-in user gets `401`; a role that is not allowed
  for a route gets `403`. Role checks run on the server in every handler.

## Listing records

`GET /records` returns JSON:

```json
{ "count": 2, "records": [ { "id": 4, "title": "Insurance renewal 2026", "owner": "marco", "status": "active", "createdAt": "2026-04-18T16:20:00Z" } ] }
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

## Exporting records

Administrators can save the records they filtered as a CSV file.

`POST /records/export` takes the same `status`, `owner`, and `q` query
parameters as `GET /records`, with the same validation, and exports exactly
the records that listing returns for them, ordered by `id`. Any request body
is ignored.

- Only `admin` users can export. A request without a signed-in user gets
  `401`, and an `editor` or `viewer` gets `403`; no file is created.
- An invalid `status` gets `400`; no file is created.
- On success the response is `201` with
  `content-type: text/csv; charset=utf-8`, a `content-disposition`
  attachment header naming the file, and the CSV as the body.
- Exports use `POST`. A `GET` request to `/records/export` returns `404`.

The CSV starts with the header row `id,title,owner,status,createdAt`, and
every row ends with CRLF. A field containing a comma, a double quote, or a
line break is enclosed in double quotes, and each double quote inside it is
doubled, for example `"Q2 ""priority"" accounts review"`.

The service also keeps each export as
`exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named from the UTC time of the
request. Two exports started within the same second share a file name, and
the later one replaces the earlier file. Export files are not removed
automatically.

## Errors

Errors are JSON objects of the form `{"error": "..."}`:

| Status | Meaning                                                |
| ------ | ------------------------------------------------------ |
| 400    | Invalid query parameter                                |
| 401    | No signed-in user                                      |
| 403    | Role not allowed for this route                        |
| 404    | Unknown path; also returned for `GET /records/export`  |
| 405    | Known path, unsupported method                         |
| 500    | Unexpected server error                                |
