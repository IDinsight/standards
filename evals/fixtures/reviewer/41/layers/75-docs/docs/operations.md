# Operating hookrelay

## Running

The dispatcher service calls `relayBatch(events, { send: httpSender(url) })`
from `src/relay.js` for each batch of events. There is no separate process to
start.

## Configuration

Settings are read from the environment when a batch starts.

| Variable               | Default | Meaning                                                                   |
| ---------------------- | ------- | ------------------------------------------------------------------------- |
| `RELAY_TIMEOUT_MS`     | `5000`  | How long to wait for the receiver to answer one request, in milliseconds. |
| `RELAY_MAX_ATTEMPTS`   | `3`     | Attempts per event, including the first. Minimum 1.                       |
| `RELAY_BACKOFF_MS`     | `500`   | Wait before the second attempt, in milliseconds. Minimum 0.               |
| `RELAY_MAX_BACKOFF_MS` | `8000`  | Longest wait between two attempts, in milliseconds. Minimum 0.            |

A value that is not a whole number, or is below its minimum, stops the batch
with an error that names the variable, for example
`RELAY_MAX_ATTEMPTS must be an integer >= 1, got "0"`.

## Delivery retries

A delivery is retried when the receiver answers with a 5xx status or 429, or
when no answer arrives (network error or timeout). Any other 4xx answer is
final: the event is reported as failed after the first attempt.

The wait before the second attempt is `RELAY_BACKOFF_MS`. Each further wait is
twice the previous one, but never more than `RELAY_MAX_BACKOFF_MS`. With the
defaults, an event that keeps failing is tried 3 times, waiting 500 ms and then
1000 ms.

To turn retries off, set `RELAY_MAX_ATTEMPTS=1`.

Retries happen inside the batch, so a slow or failing receiver makes the batch
take longer. Retries are not kept across restarts.

## Logs

Each event produces one line on standard output:

`<event id> delivered|failed status=<code> attempts=<n>`

`attempts` is the number of requests made for the event, so it is above 1 when
retries happened. `status=0` means the last request got no answer (network
error or timeout).
