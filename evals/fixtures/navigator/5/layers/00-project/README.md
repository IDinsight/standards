# records-sync

Pushes JSON records to the records service in batches.

    records-sync records.json https://records.example.internal/

Press Ctrl-C to cancel a running sync.

## Library

- `createClient({ transport, retry })`: `retry` options are `attempts`
  (default 3) and `delayMs` (default 500). `request(method, path, body, { signal })`
  accepts an `AbortSignal`.
- `syncRecords(client, records, { batchSize, signal })`: returns `{ sent, failed }`.

Run tests with `npm test`.
