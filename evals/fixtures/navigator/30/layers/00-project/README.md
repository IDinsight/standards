# quote-service

HTTP service that prices an order. `GET /quote?sku=<sku>&region=<region>&qty=<n>`
asks the rates provider for the unit price of the SKU and the regional fee, and
returns the total.

## Running

- `npm start` starts the server on `PORT` (8080 by default).
- `npm test` runs the unit tests.
- `npm run load` sends a burst of quote requests to a running instance and
  writes a status summary to `var/load/last-run.txt` (see `scripts/load.js`).

## Configuration

| Variable              | Default                              | Meaning                                                   |
| --------------------- | ------------------------------------ | --------------------------------------------------------- |
| `PORT`                | `8080`                               | HTTP port                                                 |
| `PROVIDER_URL`        | `http://rates.partner.internal:9000` | Base URL of the rates provider                            |
| `POOL_SIZE`           | `4`                                  | Most provider requests in flight at once                  |
| `ACQUIRE_TIMEOUT_MS`  | `2000`                               | How long a provider request may wait for a free slot      |
| `PROVIDER_TIMEOUT_MS` | `5000`                               | How long a provider request may take, including the body  |
| `LOG_FILE`            | `var/log/quotes.log`                 | Log file, written in addition to stdout                   |

## Logs

Each `/quote` request writes one line once its response has been sent:
timestamp, level, method, path, status, and for failures the error name and
message. Timeouts are answered with 504, provider errors with 502.
