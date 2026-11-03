# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records as CSV (see
  [Exporting records as CSV](#exporting-records-as-csv)).
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

Administrators can save the records they are looking at as a CSV file.

`POST /records/export` takes the same `status`, `owner`, and `q` query
parameters as `GET /records`, with the same validation, and exports exactly
the records `GET /records` would list for them, ordered by `id`. Any request
body is ignored.

On success the service:

- writes the CSV to a file named `records-<YYYYMMDDTHHMMSSZ>.csv`, using the
  UTC time of the request, in its export folder (`exports/` under the
  service's working directory by default; `createApp({ exportDir })` sets
  another folder). The folder is created when missing.
- responds `201` with `content-type: text/csv; charset=utf-8`,
  `content-disposition: attachment; filename="<file name>"`, and the same CSV
  as the body.

Two exports within the same second get the same file name, and the later one
replaces the earlier file. Export files are not removed automatically.

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record.
- Every row, including the last, ends with CRLF.
- A field that contains a comma, a double quote, or a line break is enclosed
  in double quotes, and each double quote inside it is doubled. Other fields
  are written as they are.

Example: `POST /records/export?owner=dana` by an administrator returns and
writes:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Export errors

- `401` `{"error": "authentication required"}`: no signed-in user.
- `403` `{"error": "forbidden"}`: the user is an editor or a viewer.
- `400` `{"error": "unknown status: <value>"}`: invalid `status` filter.

A request rejected with `400`, `401`, or `403` writes no file and creates no export folder:
the service checks the user's role and the filters before it writes anything.

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
