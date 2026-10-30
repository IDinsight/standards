# records-transfer

Keeps records in memory and moves them in and out as CSV.

- `importRecords(source, store)` reads CSV from a file path or readable stream
  and adds every row to the store.
- `exportRecords(store, destination)` writes every record as CSV to a file path
  or writable stream.

CSV files have the header `id,title,owner`, CRLF row endings, rows in id order,
and RFC 4180 quoting. Both directions go through the shared stream helper in
`src/io/transfer.js`.

## Development

Requires Node 22. There are no dependencies and no build step.

    npm test
