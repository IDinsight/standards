// Client for the clinic mailer service.
export function createMailer(baseUrl, fetchImpl = fetch) {
  return {
    async send({ to, subject, text }) {
      const response = await fetchImpl(new URL('/messages', baseUrl), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to, subject, text }),
      });
      if (!response.ok) throw new Error(`mailer responded with ${response.status}`);
    },
  };
}
