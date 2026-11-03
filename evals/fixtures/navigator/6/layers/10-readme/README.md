# ingest-worker

Reads newline-delimited JSON events from a file and forwards them to the
events service's bulk endpoint in batches.

```sh
node src/main.js events.ndjson
```

## Configuration

Defaults live in `config/default.json`. Each setting can be overridden with an
environment variable.

| Setting           | Default | Environment variable       |
| ----------------- | ------- | -------------------------- |
| `batchSize`       | 500     | `INGEST_BATCH_SIZE`        |
| `maxInFlight`     | 4       | `INGEST_MAX_IN_FLIGHT`     |
| `flushIntervalMs` | 2000    | `INGEST_FLUSH_INTERVAL_MS` |
| `maxRetries`      | 3       | `INGEST_MAX_RETRIES`       |
| `retryDelayMs`    | 250     | `INGEST_RETRY_DELAY_MS`    |
| `sinkUrl`         | local   | `INGEST_SINK_URL`          |

## How sending works

Records are collected in memory until `batchSize` records are waiting or
`flushIntervalMs` has passed since the first one arrived. Up to `maxInFlight`
batches are sent at the same time; when every slot is busy, reading pauses
until one finishes. A failed batch is retried as a whole with exponential
backoff starting at `retryDelayMs`, up to `maxRetries` times, and is then
counted as failed. Each request has a 10 second timeout.

## Tests

```sh
npm test
```
