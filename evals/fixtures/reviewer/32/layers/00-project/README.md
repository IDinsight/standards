# records-export

CSV export for the records admin backend. Records are read through a
`RecordSource` and rendered as RFC 4180 CSV.

## Development

Requires Node 22. TypeScript sources run directly through Node's type
stripping; `tsc` is used only for type checking.

    npm install        # TypeScript and Node type definitions
    npm test
    npm run typecheck

## Layout

- `src/records.ts`: record type, `RecordSource`, and the in-memory source
- `src/csv.ts`: header, cell quoting, and row rendering
- `src/export.ts`: the export itself
- `test/`: `node:test` suites
