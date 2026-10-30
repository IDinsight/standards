# records-sync

Pushes JSON records to the records service in batches.

    records-sync records.json https://records.example.internal/

Press Ctrl-C to cancel a running sync.

## Library

- `createClient({ transport, retry })`: `retry` options are `attempts`
  (default 4), `baseDelayMs` (default 200), `maxDelayMs` (default 2000), and
  `retryable` (an error predicate). `request(method, path, body, { signal })`
  accepts an `AbortSignal`.
- `syncRecords(client, records, { batchSize, signal })`: returns `{ sent, failed }`.

Run tests with `npm test`.
