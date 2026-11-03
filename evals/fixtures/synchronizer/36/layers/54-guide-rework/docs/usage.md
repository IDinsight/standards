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

## Exporting records as CSV

Administrators can save the records they have filtered as a CSV file:

    POST /records/export?status=active&owner=marco

`POST /records/export` takes the same `status`, `owner`, and `q` query
parameters as `GET /records`, with the same validation, and exports exactly
the records `GET /records` lists for that query, in the same order. Blank
values and other parameters are ignored, as when listing. A request body is
ignored.

Only `admin` users can export. The service checks the role before doing
anything else, so a rejected request never creates an export file:

- No signed-in user: `401` with `{"error": "authentication required"}`.
- `editor` or `viewer`: `403` with `{"error": "forbidden"}`.
- An invalid `status`: `400`, as when listing, and no file is written.
- `GET /records/export`: `405`; the export must be requested with `POST`.

A successful export writes the CSV to
`exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named after the UTC time of the
request (for example `records-20260924T090000Z.csv`), and returns `201` with:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-<YYYYMMDDTHHMMSSZ>.csv"`
- the same CSV as the response body.

The `exports` folder is created when it is missing. It is relative to the
service's working directory, can be changed with the `exportDir` option of
`createApp`, and is ignored by git.

### CSV format

The file is UTF-8 without a byte order mark. The first row is the header
`id,title,owner,status,createdAt`, followed by one row per record. Every row,
including the last, ends with CRLF. A field that contains a comma, a double
quote, or a line break is enclosed in double quotes, and each double quote
inside it is doubled (RFC 4180); other fields are written as they are.

An export with `owner=dana` contains:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

An export with `q=review` matches titles without regard to case, as when
listing, and contains only record 3:

```csv
id,title,owner,status,createdAt
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Limits

- Two exports in the same second get the same file name; the later one
  replaces the earlier file.
- The service does not remove export files.

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
