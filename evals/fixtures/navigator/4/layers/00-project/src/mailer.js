import { DEFAULT_FROM } from './config.js';

export function createMailer({ from = DEFAULT_FROM, transport }) {
  if (typeof transport !== 'function') {
    throw new TypeError('createMailer needs a transport function');
  }
  return {
    async send(reminder) {
      await transport({ from, to: reminder.to, subject: 'Reminder', text: reminder.text });
    },
  };
}
