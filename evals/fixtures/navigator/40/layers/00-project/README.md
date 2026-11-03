# httpkit

Small helpers for calling JSON APIs from Node 22, with retries for transient
failures. No dependencies.

```js
import { getJson } from 'httpkit';

const user = await getJson('https://api.example.com/users/7');
```

Run the tests with `npm test`.

## Retries

`withRetry(operation, options)` runs `operation` and runs it again when it
fails with a retryable error. `getJson` uses it for every request.

- `retries` (default `3`): the number of retries after the first attempt. A
  call makes at most `retries + 1` attempts; `retries: 0` runs the operation
  once and never retries.
- `baseDelayMs` (default `100`): the wait before the first retry. Each
  following retry waits twice as long as the previous one (100 ms, 200 ms,
  400 ms with the defaults).
- Errors with an HTTP `status` of 429 or 500-599, and errors without a
  `status` (network failures), are retryable. Any other status is thrown at
  once, without retrying.
- When every attempt fails, the error from the last attempt is thrown.
