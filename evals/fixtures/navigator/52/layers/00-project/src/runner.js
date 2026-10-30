import { linkedController, raceAbort, TimeoutError } from './signals.js';

function wait(ms) {
  let timer;
  const promise = new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  return { promise, cancel: () => clearTimeout(timer) };
}

// Run `jobs` ({ id, run(signal) }) with at most `concurrency` at a time.
// Resolves with one result per job, in input order:
//   { id, status: 'done' | 'failed' | 'timeout' | 'cancelled', attempts, value?, error?, abandoned? }
export async function runJobs(jobs, options = {}) {
  const { signal, concurrency = 2, timeoutMs, retries = 0, drainMs = 1000 } = options;
  const results = new Array(jobs.length);
  // Latest attempt of each started job, settled either way.
  const started = new Map();
  let next = 0;

  async function runOne(index) {
    const job = jobs[index];
    let attempts = 0;
    for (;;) {
      if (signal?.aborted) {
        results[index] = { id: job.id, status: 'cancelled', attempts };
        return;
      }
      attempts += 1;
      const link = linkedController(signal, timeoutMs);
      const work = Promise.resolve().then(() => job.run(link.signal));
      started.set(index, work.then(() => {}, () => {}));
      try {
        const value = await raceAbort(work, link.signal);
        results[index] = { id: job.id, status: 'done', value, attempts };
        return;
      } catch (error) {
        if (signal?.aborted) {
          results[index] = { id: job.id, status: 'cancelled', attempts };
          return;
        }
        if (attempts > retries) {
          const timedOut = link.signal.reason instanceof TimeoutError;
          results[index] = { id: job.id, status: timedOut ? 'timeout' : 'failed', error, attempts };
          return;
        }
      } finally {
        link.dispose();
      }
    }
  }

  async function worker() {
    while (next < jobs.length) {
      const index = next;
      next += 1;
      await runOne(index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));

  // Give jobs that were running when the signal aborted a chance to finish
  // their own cleanup before we report.
  if (signal?.aborted && started.size > 0) {
    const settled = new Set();
    for (const [index, done] of started) done.then(() => settled.add(index));
    const timer = wait(drainMs);
    await Promise.race([Promise.all(started.values()), timer.promise]);
    timer.cancel();
    for (const index of started.keys()) {
      if (results[index].status === 'cancelled' && !settled.has(index)) results[index].abandoned = true;
    }
  }
  return results;
}
