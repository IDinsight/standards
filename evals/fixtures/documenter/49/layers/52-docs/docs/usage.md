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

`POST /records/export` saves the records matching the given filters as a CSV
file and returns the same CSV. Administrators use it to take a filtered list
into a spreadsheet.

It accepts the same `status`, `owner`, and `q` query parameters as
`GET /records`, with the same validation, and exports exactly the records
`GET /records` lists for that query, ordered by `id`. Any request body is
ignored. Example: `POST /records/export?status=active&owner=marco`.

A successful export returns `201` with these headers:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-20260924T090000Z.csv"`
  (the name of the file written for this export)

The response body is identical to the written file.

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record.
  If nothing matches, the file holds only the header row.
- Every row, including the last, ends with CRLF.
- A field that contains a comma, a double quote, or a line break is enclosed
  in double quotes, and each double quote inside it is doubled (RFC 4180).
  Other fields are written as they are.

Exporting `owner=dana` from the seed data gives:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Export files

Each export is written to `exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named
after the UTC time of the request, in the service's working directory. The
folder is created when missing and is ignored by git. Code that builds the
app with `createApp` can choose another folder with the `exportDir` option.
Two exports in the same second get the same name, and the later one replaces
the earlier file. Export files are not removed automatically.

### Export errors

- No signed-in user: `401` with `{"error": "authentication required"}`.
- `editor` or `viewer`: `403` with `{"error": "forbidden"}`.
- Invalid `status`: `400` with `{"error": "unknown status: <value>"}`.
- Any other method on `/records/export`: `405`.

A denied or invalid request writes no file and does not create the export
folder.

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
