# records-export

CSV export helpers for the records admin service. The service passes the
records a user has filtered to `toCsv` and offers the result as a download.

## Development

Requires Node 22. There are no dependencies and no build step; TypeScript runs
through Node's type stripping.

    npm test
