# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records as CSV.
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

Listing and exporting take the same query parameters; all given filters must
match:

- `status`: `active` or `archived`. Any other value, including an empty one,
  returns `400` with `{"error": "unknown status: <value>"}`.
- `owner`: exact owner username, for example `marco`.
- `q`: case-insensitive text that must appear in the title.

Other parameters are ignored.

Example: `GET /records?status=active&owner=marco` lists marco's active records.

## Exporting records as CSV

Administrators can save the records they are looking at as a CSV file for a
spreadsheet.

`POST /records/export` takes the [filters](#filtering) as query parameters
and ignores any request body. It writes the matching records to a new file in
the export folder and returns the same CSV in the response.

- Only `admin` may export. Without a signed-in user the request gets `401`
  with `{"error": "authentication required"}`; an `editor` or `viewer` gets
  `403` with `{"error": "forbidden"}`. No file is written.
- An unknown `status` returns `400` as it does for listing, and no file is
  written.
- On success the response is `201` with
  `content-type: text/csv; charset=utf-8` and
  `content-disposition: attachment; filename="<file name>"`. The body is the
  file's contents.

### Export file

The file is named `records-<YYYYMMDDTHHMMSSZ>.csv` after the UTC time of the
request, for example `records-20260924T090000Z.csv`. It is written to the
export folder, `exports/` unless the service is created with another
`exportDir`; a relative folder is resolved against the service's working
directory. The folder is created when it does not exist and is ignored by
git. Two exports in the same second get the same name, and the later one
replaces the earlier file. Export files are not removed automatically.

### CSV format

- UTF-8, without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record:
  the records `GET /records` returns for the same filters, in `id` order.
- Every row, including the last, ends with CRLF.
- A field that contains a comma, a double quote, a carriage return, or a line
  feed is enclosed in double quotes, and each double quote inside it is
  doubled (RFC 4180). Other fields are written as they are.

Example: `POST /records/export?owner=dana` by an administrator writes and
returns:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

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
