# Operations guide

This guide is for operators running the relay in staging and production.

## Running the relay

    TARGET_URL=https://hooks.example.com/in node bin/relay.js

The relay listens on `PORT` and accepts events as JSON with `POST /events`. It
answers `202 Accepted` once an event is queued for delivery, or
`400 Bad Request` when the body is not valid JSON. Each event is forwarded to
`TARGET_URL` as a JSON `POST`.

## Configuration

| Variable     | Default         | Purpose                            |
| ------------ | --------------- | ---------------------------------- |
| `PORT`       | `8080`          | Port for incoming events.          |
| `TARGET_URL` | none (required) | Endpoint that receives each event. |

`PORT` must be a positive integer. Any other value stops the relay at startup
with an error such as `PORT must be a positive integer, got "abc"`.

### Checking configuration

`--print-config` prints the effective configuration as JSON and exits without
starting the server:

    $ TARGET_URL=https://hooks.example.com/in node bin/relay.js --print-config
    {"port":8080,"targetUrl":"https://hooks.example.com/in"}

## Failed deliveries

A delivery fails when the target cannot be reached or answers with a status
outside 200–299. The relay retries it three times, waiting 1, 2, and 4 seconds
before each retry. If the last retry also fails, the relay logs
`delivery dropped: <error>` and discards the delivery.

## Restarting

Deliveries waiting for a retry are held in memory and are lost when the relay
stops. Stop the relay while the target is healthy to avoid losing them.
