import { queueMessage } from './mailer.js';

// A hold: { id, patron: { name, email }, title, status: 'waiting' | 'ready' | 'collected' }

export function queueHoldReadyNotices(holds, outbox) {
  let queued = 0;
  for (const hold of holds) {
    if (hold.status !== 'ready') continue;
    queueMessage(outbox, {
      to: hold.patron.email,
      subject: `Ready for pickup: ${hold.title}`,
      body: `Hello ${hold.patron.name},\n\n"${hold.title}" is waiting for you at the front desk.\n`,
    });
    queued += 1;
  }
  return queued;
}
