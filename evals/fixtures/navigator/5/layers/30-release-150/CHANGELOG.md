# Changelog

## 1.5.0

- Retry waits now grow exponentially (`baseDelayMs`, `maxDelayMs`) instead of
  using a fixed `delayMs`.
- Cancelling a request now interrupts a pending retry wait.
- Sync reports batches the server rejects with a 4xx status.

## 1.4.0

- Batch sync with per-batch failure reporting (`syncRecords`).
- Requests can be cancelled with an `AbortSignal`.

## 1.3.0

- Records client with fixed-delay retry.
