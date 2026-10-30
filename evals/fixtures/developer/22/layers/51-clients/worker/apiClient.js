import { SESSION_COOKIE } from '../shared/session.js';

export function createWorkerClient({ baseUrl, sessionId = process.env.WORKER_SESSION_ID, fetchImpl = fetch }) {
  if (!sessionId) throw new Error('WORKER_SESSION_ID is not set');
  return {
    async completeJob(jobId) {
      const response = await fetchImpl(`${baseUrl}/jobs/complete`, {
        method: 'POST',
        headers: { cookie: `${SESSION_COOKIE}=${sessionId}`, 'content-type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (response.status !== 204) throw new Error(`job ${jobId} completion rejected: ${response.status}`);
    },
  };
}
