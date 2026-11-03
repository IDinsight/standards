import { config } from './config.js';
import { deliver } from './webhooks/deliver.js';

export function createNotifier(send) {
  return {
    url: config.webhookUrl,
    notify: (event) => deliver(send, event),
  };
}
