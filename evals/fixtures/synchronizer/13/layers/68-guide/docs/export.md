# Exporting records as CSV

Administrators can save the records they have filtered as a CSV file:

    POST /records/export?status=active&owner=marco

`POST /records/export` takes the same `status`, `owner`, and `q` query
parameters as `GET /records`, with the same validation, and exports exactly
the records `GET /records` lists for that query, in the same order. A request
body is ignored.

## Access and errors

Only `admin` users can export. The service checks the role before doing
anything else, so a rejected request never creates an export file:

- No signed-in user: `401` with `{"error": "authentication required"}`.
- `editor` or `viewer`: `403` with `{"error": "forbidden"}`.
- An invalid `status`: `400`, as when listing, and no file is written.
- `GET /records/export`: `405`; the export must be requested with `POST`.

## What an export returns and writes

A successful export writes the CSV to
`exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named after the UTC time of the
request (for example `records-20260924T090000Z.csv`), and returns `201` with:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-<YYYYMMDDTHHMMSSZ>.csv"`
- the same CSV as the response body.

The `exports` folder is created when it is missing. It is relative to the
service's working directory, can be changed with the `exportDir` option of
`createApp`, and is ignored by git.

## CSV format

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

## Limits

- Two exports in the same second get the same file name; the later one
  replaces the earlier file.
- The service does not remove export files.
