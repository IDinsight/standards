import { makeSendEmail } from './handlers/sendEmail.js';
import { MemoryQueue } from './queue.js';
import { Worker } from './worker.js';

const consoleTransport = {
  async send(message) {
    console.log(`[mail] to=${message.to} subject=${message.subject}`);
  },
};

export function createWorker({ transport = consoleTransport, ...options } = {}) {
  const queue = options.queue ?? new MemoryQueue();
  return new Worker({ ...options, queue, handlers: { 'send-email': makeSendEmail(transport) } });
}
