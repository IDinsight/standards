import { CancelledError, RetryExhaustedError } from './retry.js';

export async function syncRecords(client, records, { batchSize = 50, signal } = {}) {
  const result = { sent: 0, failed: [] };
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
      throw error;
    }
  }
  return result;
}
