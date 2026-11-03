# Operations guide

This guide is for operators running the relay in staging and production.

## Running the relay

    TARGET_URL=https://hooks.example.com/in node bin/relay.js

The relay listens on `PORT` and accepts events as JSON with `POST /events`. It
answers `202 Accepted` once an event is queued for delivery, or
`400 Bad Request` when the body is not valid JSON. Each event is forwarded to
`TARGET_URL` as a JSON `POST`.

## Configuration

| Variable           | Default                  | Purpose                                                     |
| ------------------ | ------------------------ | ----------------------------------------------------------- |
| `PORT`             | `8080`                   | Port for incoming events.                                   |
| `TARGET_URL`       | none (required)          | Endpoint that receives each event.                          |
| `RETRY_LIMIT`      | `5`                      | Number of retries after a failed first attempt.             |
| `DEAD_LETTER_PATH` | `data/dead-letter.jsonl` | File that keeps deliveries whose attempts are all used up. |

`PORT` and `RETRY_LIMIT` must be positive integers. Any other value stops the
relay at startup with an error such as
`RETRY_LIMIT must be a positive integer, got "0"`.

### Checking configuration

`--print-config` prints the effective configuration as JSON and exits without
starting the server:

    $ RETRY_LIMIT=8 TARGET_URL=https://hooks.example.com/in node bin/relay.js --print-config
    {"port":8080,"targetUrl":"https://hooks.example.com/in","retryLimit":8,"deadLetterPath":"data/dead-letter.jsonl"}

## Failed deliveries

A delivery fails when the target cannot be reached or answers with a status
outside 200–299. The relay then retries it up to `RETRY_LIMIT` times, so with
the default of 5 a delivery is attempted at most six times. The wait before
each retry starts at 1 second and doubles, up to 30 seconds: 1, 2, 4, 8, and 16
seconds with the default limit.

When the last attempt fails, the relay appends the delivery to
`DEAD_LETTER_PATH` as one JSON object per line, creating the folder if needed,
and logs `delivery dead-lettered after N attempt(s)`. Each line has these
fields:

- `id`: the event's `id`, or `null` when it had none.
- `event`: the event as received.
- `error`: the message of the last error.
- `attempts`: the number of attempts made.
- `failedAt`: when the line was written, as an ISO 8601 UTC timestamp.

The relay never reads this file back, so dead-lettered deliveries are not
resent automatically. Inspect the file and resend the events yourself once the
target is healthy, then archive or remove the file.

## Restarting

Deliveries waiting for a retry are held in memory and are lost when the relay
stops. Stop the relay while the target is healthy to avoid losing them.
