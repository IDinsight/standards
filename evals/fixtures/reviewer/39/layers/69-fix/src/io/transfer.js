import { pipeline } from 'node:stream/promises';

export class TransferTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`transfer did not finish within ${timeoutMs} ms`);
    this.name = 'TransferTimeoutError';
    this.code = 'ETRANSFERTIMEOUT';
    this.timeoutMs = timeoutMs;
  }
}

// Moves data from a readable source into a writable destination. Shared by
// import and export so both handle stream errors the same way: an error on
// either side rejects and destroys both streams.
//
// With a positive timeoutMs the transfer rejects with TransferTimeoutError when
// it has not finished in time. Without one it waits as long as the streams take.
export async function transfer(source, destination, { timeoutMs = 0 } = {}) {
  if (!(timeoutMs > 0)) return pipeline(source, destination);
  const controller = new AbortController();
  let timer;
  // Aborting destroys both streams. The timeout is reported at once: a stalled
  // stream may never finish closing, so the caller does not wait for that.
  const timedOut = new Promise((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort(new TransferTimeoutError(timeoutMs));
      reject(controller.signal.reason);
    }, timeoutMs);
  });
  try {
    const finished = pipeline(source, destination, { signal: controller.signal });
    return await Promise.race([finished, timedOut]);
  } catch (error) {
    // Report the timeout rather than the abort error the pipeline raises.
    throw controller.signal.aborted ? controller.signal.reason : error;
  } finally {
    clearTimeout(timer);
  }
}
