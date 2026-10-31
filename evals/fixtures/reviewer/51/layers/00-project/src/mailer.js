export function createOutbox() {
  return [];
}

export function queueMessage(outbox, { to, subject, body }) {
  if (!to || !to.includes('@')) throw new TypeError(`Invalid recipient: ${to}`);
  outbox.push({ to, subject, body });
  return outbox.length;
}
