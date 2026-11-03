import { CancelledError, RetryExhaustedError } from './retry.js';
import { HttpError } from './transport.js';

export async function syncRecords(client, records, { batchSize = 50, signal } = {}) {
  const result = { sent: 0, failed: [], rejected: [] };
  for (let start = 0; start < records.length; start += batchSize) {
    const batch = records.slice(start, start + batchSize);
    try {
      await client.request('POST', '/records/batch', { records: batch }, { signal });
      result.sent += batch.length;
    } catch (error) {
      if (error instanceof CancelledError) throw error;
      if (error instanceof RetryExhaustedError) {
        result.failed.push({ start, count: batch.length, reason: error.message });
        continue;
      }
      if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
        result.rejected.push({ start, count: batch.length, status: error.status });
        continue;
      }
      throw error;
    }
  }
  return result;
}
