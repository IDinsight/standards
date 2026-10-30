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

Query parameters narrow the list; all given filters must match:

- `status`: `active` or `archived`. Any other value returns `400` with
  `{"error": "unknown status: <value>"}`.
- `owner`: exact owner username, for example `marco`.
- `q`: case-insensitive text that must appear in the title.

Blank values and other parameters are ignored.

Example: `GET /records?status=active&owner=marco` lists marco's active records.

## Exporting records as CSV

Administrators can save the records they are viewing as a CSV file with
`POST /records/export`. It takes the same `status`, `owner`, and `q` query
parameters as `GET /records`, validated the same way, and exports exactly the
records `GET /records` would list for that query, in `id` order. A request
body is ignored.

- Only `admin` may export. Without a signed-in user the request gets `401`
  with `{"error": "authentication required"}`; an `editor` or `viewer` gets
  `403` with `{"error": "forbidden"}`. A denied request writes nothing.
- An invalid `status` gets `400` (see Filtering) and writes nothing.
- On success the response is `201` with
  `content-type: text/csv; charset=utf-8` and
  `content-disposition: attachment; filename="records-<YYYYMMDDTHHMMSSZ>.csv"`;
  the body is the CSV.

The service also writes the same CSV to a file named
`records-<YYYYMMDDTHHMMSSZ>.csv` (UTC time of the request) in its export
folder: `exports/` under the service's working directory unless `createApp` is
given another `exportDir`. The folder is created when missing and is ignored
by git. Two exports in the same second share a file name, and the later one
replaces the earlier file. The service does not remove export files.

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record.
- Every row, including the last, ends with CRLF.
- A field containing a comma, a double quote, or a line break is enclosed in
  double quotes, and each double quote inside it is doubled (RFC 4180). Other
  fields are written as they are.

Example: `POST /records/export?owner=dana` by an administrator returns

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

## Moving the admin tool to the service export

The admin tool's front end currently builds its CSV download in the browser
from `GET /records` responses. To switch it to the service export:

1. Send `POST /records/export` with the query parameters the list view already
   sends to `GET /records`.
2. Offer the response body as the download, using the file name from the
   `content-disposition` header.
3. Show the download to administrators only. Editors and viewers can no
   longer download CSV: the service answers their export requests with `403`.

Differences from a CSV assembled from `GET /records` responses:

- The columns are always `id,title,owner,status,createdAt`, in that order,
  after a header row.
- Rows end with CRLF, and fields containing commas, quotes, or line breaks are
  quoted as described under CSV format. Code that splits the file on line
  feeds or commas should use a CSV parser instead.
- Every export also leaves a file in the service's export folder.

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
