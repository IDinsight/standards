import { ArchiveError, type ArchiveClient } from './client.ts';

export type RetryOptions = {
  sleep?: (ms: number) => Promise<void>;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: ArchiveError, delayMs: number) => void;
};

export type UploadResult = { attempts: number };

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Network errors, throttling (429), and server errors (5xx) may succeed on a
// later attempt; any other response will not.
export function isTransient(error: unknown): error is ArchiveError {
  if (!(error instanceof ArchiveError)) return false;
  return error.status === undefined || error.status === 429 || error.status >= 500;
}

// Uploads one file, retrying transient failures with exponential backoff:
// 500 ms before the first retry, doubling up to 30 s between attempts.
export async function uploadWithRetry(
  client: ArchiveClient,
  name: string,
  body: string,
  options: RetryOptions = {},
): Promise<UploadResult> {
  const sleep = options.sleep ?? wait;
  const maxDelay = options.maxDelayMs ?? 30_000;
  let delay = options.baseDelayMs ?? 500;
  for (let attempt = 1; ; attempt += 1) {
    try {
      await client.put(name, body);
      return { attempts: attempt };
    } catch (error) {
      if (!isTransient(error)) throw error;
      options.onRetry?.(attempt, error, delay);
      await sleep(delay);
      delay = Math.min(delay * 2, maxDelay);
    }
  }
}
