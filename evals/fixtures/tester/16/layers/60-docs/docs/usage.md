# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records; only `admin` can
  export them.
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
the same query as a CSV file and returns the same CSV. Only administrators can
export: other roles get `403`, requests without a signed-in user get `401`,
and no file is written in either case.

- The `status`, `owner`, and `q` filters work as they do for listing,
  including the `400` for an unknown status (no file is written).
- A successful export returns `201` with
  `content-type: text/csv; charset=utf-8` and a `content-disposition`
  attachment header naming the file.
- The file is saved as `exports/records-<YYYYMMDDTHHMMSSZ>.csv`, using the
  UTC time of the request. Two exports in the same second share a name, and
  the later one replaces the earlier file.
- Columns are `id,title,owner,status,createdAt`, rows are ordered by `id`,
  and every row ends with CRLF. A value containing a comma, double quote, or
  line break is enclosed in double quotes, with any double quote inside it
  doubled, so spreadsheet programs read a title such as
  `Lease agreement, Building B` as one field.

Example: `POST /records/export?owner=dana` as an administrator saves and
returns:

```text
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
