import { createHmac } from 'node:crypto';

// Posts export results to client callback URLs. The body is signed so that
// receivers can check it came from us: x-exports-signature: sha256=<hex>.
export function createNotifier({ logger, secret, fetchImpl = fetch }) {
  return {
    async notify(url, body) {
      const payload = JSON.stringify(body);
      const signature = createHmac('sha256', secret).update(payload).digest('hex');
      try {
        const response = await fetchImpl(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-exports-signature': `sha256=${signature}` },
          body: payload,
        });
        logger.info('callback delivered', { url, status: response.status });
        return response.status;
      } catch (error) {
        logger.warn('callback failed', { url, error: error.message });
        return null;
      }
    },
  };
}
