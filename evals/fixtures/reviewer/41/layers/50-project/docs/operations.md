# Operating hookrelay

## Running

The dispatcher service calls `relayBatch(events, { send: httpSender(url) })`
from `src/relay.js` for each batch of events. There is no separate process to
start.

## Configuration

Settings are read from the environment when a batch starts.

| Variable           | Default | Meaning                                                                  |
| ------------------ | ------- | ------------------------------------------------------------------------ |
| `RELAY_TIMEOUT_MS` | `5000`  | How long to wait for the receiver to answer one request, in milliseconds. |

A value that is not a whole number, or is below its minimum, stops the batch
with an error that names the variable, for example
`RELAY_TIMEOUT_MS must be an integer >= 1, got "soon"`.

## Logs

Each event produces one line on standard output:

`<event id> delivered|failed status=<code> attempts=<n>`

`attempts` is always 1. `status=0` means the request got no answer (network
error or timeout).
