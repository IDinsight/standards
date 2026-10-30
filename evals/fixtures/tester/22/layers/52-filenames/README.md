# records-export

CSV export helpers for the records admin service. The service passes the
records a user has filtered to `toCsv` and offers the result as a download
named with `exportFileName`.

## API

- `toCsv(records)`: the header row `id,title,owner,status,createdAt`, then one
  row per record in the given order. Every row ends with CRLF.
- `csvCell(value)`: one field. A value containing a comma, double quote, CR,
  or LF is enclosed in double quotes with embedded double quotes doubled
  (RFC 4180); other values are written as they are.
- `exportFileName(now)`: `records-<YYYYMMDDTHHMMSSZ>.csv`, using UTC.

## Development

Requires Node 22. There are no dependencies and no build step; TypeScript runs
through Node's type stripping.

    npm test

The `test` script runs `node --test test/*.test.ts`.
