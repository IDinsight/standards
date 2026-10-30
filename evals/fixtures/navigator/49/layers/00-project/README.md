# retry-helper

`withRetry(send, options)` calls `send()` and retries responses with a
transient status (408, 429, and the 5xx gateway and availability errors) using
capped exponential backoff.

Options:

- `attempts` (default 3): total number of calls to `send()`.
- `sleep` (default `setTimeout`-based): how to wait between attempts.

Run the tests with `npm test`.
