import { verifyToken } from '../auth/token.js';

export function processJob(job, { secret, handlers }) {
  const result = verifyToken(job.token, secret);
  if (!result.ok) return { status: 'rejected', reason: result.reason };
  const handler = handlers[job.type];
  if (!handler) return { status: 'rejected', reason: 'unknown job type' };
  return { status: 'done', output: handler(job.data, result.payload) };
}
