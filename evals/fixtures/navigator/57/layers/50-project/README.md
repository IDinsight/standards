# chunked-upload

Uploads files in chunks and retries failed chunks.

## retry(fn, options)

Calls `fn` until it succeeds or the attempts run out, waiting between calls
with exponential backoff.

- `attempts` (default 3): total calls of `fn`, including the first.
- `baseDelayMs` (default 100): wait after the first failure; doubles after
  each further failure.
- `maxDelayMs` (default 2000): upper limit for any single wait.
- `wait`: function used to wait; defaults to a timer.

An error with `retryable: false` is rethrown immediately. When every attempt
fails, `retry` throws `RetryError` with the last error as `cause`.

Run the tests with `npm test`.
