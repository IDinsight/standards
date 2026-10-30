# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records. Only `admin` can
  export them (see [Exporting records as CSV](#exporting-records-as-csv)).
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
`POST /records/export` accepts the same query parameters as `GET /records`
(`status`, `owner`, `q`), with the same validation, and exports exactly the
records `GET /records` lists for them, ordered by `id`. A request body is
ignored.

Example: `POST /records/export?status=active&owner=marco` exports marco's
active records.

### Who may export

Only `admin`. Requests from an `editor` or `viewer`, and requests without a
signed-in user, get `401` with `{"error": "authentication required"}`. A
denied request writes no file.

### What an export returns and writes

A successful export:

- writes the CSV to a file named `records-<YYYYMMDDTHHMMSSZ>.csv`, stamped
  with the UTC time of the request, in the service's export folder. The
  folder is `exports/` under the service's working directory unless the
  service is configured with another one, and it is created when missing;
- responds `201` with `content-type: text/csv; charset=utf-8`,
  `content-disposition: attachment; filename="<file name>"`, and the same CSV
  as the body.

Two exports in the same second get the same file name, and the later one
replaces the earlier file. Export files are not removed by the service.

### CSV format

The file is UTF-8 without a byte order mark. The first row is the header
`id,title,owner,status,createdAt`, followed by one row per record. Every row,
including the last, ends with CRLF. A field that contains a comma, a double
quote, or a line break is enclosed in double quotes, and each double quote
inside it is doubled; other fields are written as they are.

`POST /records/export?owner=dana` writes:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Export errors

- `400` with `{"error": "unknown status: <value>"}` for an invalid `status`;
  no file is written.
- `401` for any request that is not from an administrator, as described under
  [Who may export](#who-may-export).

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
