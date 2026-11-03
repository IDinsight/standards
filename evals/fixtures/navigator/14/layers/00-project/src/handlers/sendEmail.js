export function makeSendEmail(transport) {
  return async function sendEmail(payload) {
    if (!payload?.to || !payload?.subject) {
      throw new Error('send-email job needs "to" and "subject"');
    }
    await transport.send({ to: payload.to, subject: payload.subject, text: payload.text ?? '' });
  };
}
