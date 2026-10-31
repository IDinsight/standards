# visit-log

Exports field visit records to CSV.

```sh
node bin/export-visits.js [file]
```

The file defaults to `data/visits.json`. Output goes to stdout with a header
row (`date,site,visitor,notes`).

Run the tests with `npm test`.
