// Runs queued jobs one at a time until the queue is empty. A failing job is
// reported through onError and does not stop the loop.
export async function drain(queue, { onError = () => {} } = {}) {
  let ran = 0;
  while (queue.size > 0) {
    const job = queue.dequeue();
    try {
      await job.run();
    } catch (error) {
      onError(job, error);
    }
    ran += 1;
  }
  return ran;
}
