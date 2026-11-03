# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records through the service.
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

`POST /records/export` saves the records that `GET /records` would list for
the same query as a CSV file and returns the same CSV. It accepts the
`status`, `owner`, and `q` filters with the same validation; an invalid
`status` returns `400` and no file is written.

Only administrators can export. A request without a signed-in user gets
`401` and an `editor` or `viewer` gets `403`; in both cases no file is
written.

A successful export returns `201` with the headers
`content-type: text/csv; charset=utf-8` and
`content-disposition: attachment; filename="records-<timestamp>.csv"`. The
file is saved in the service's export folder (`exports` by default) as
`records-<YYYYMMDDTHHMMSSZ>.csv`, using the UTC time of the request. Two
exports in the same second get the same name, and the later one replaces the
earlier file.

### CSV format

- The first row is `id,title,owner,status,createdAt`, followed by one row per
  record, ordered by `id`. Every row, including the last, ends with CRLF.
- A field containing a comma, a double quote, or a line break is enclosed in
  double quotes, and each double quote inside it is doubled: the title
  `Q2 "priority" accounts review` is written as
  `"Q2 ""priority"" accounts review"`.

## Exporting from the command line

Operators with a shell on the service host can write the same export file
without sending a request to the service. From the project folder:

    node src/cli/export-records.ts --status active --owner dana --dir exports/dana

Options:

- `--status`, `--owner`, `--q`: the same filters as `GET /records`, with the
  same validation.
- `--dir <folder>`: folder that receives the export file; it is created when
  missing. Defaults to `exports` in the current folder.

The command prints the path of the file it wrote, for example
`Wrote 1 record to exports/dana/records-20260924T090000Z.csv`. An unknown
option or an invalid `status` prints the error and exits with code 2 without
writing a file.

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
