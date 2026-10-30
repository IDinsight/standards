import { retry } from './retry.js';

export async function uploadChunk(client, chunk) {
  return retry(async () => {
    const response = await client.put(chunk.path, chunk.body);
    if (response.status >= 500) throw new Error('upload failed with ' + response.status);
    if (response.status >= 400) {
      const error = new Error('upload rejected with ' + response.status);
      error.retryable = false;
      throw error;
    }
    return response;
  });
}
