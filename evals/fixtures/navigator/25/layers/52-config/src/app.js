import { loadConfig } from './config.js';
import { deliver } from './webhooks/deliver.js';

export function createNotifier(send, env) {
  const config = loadConfig(env);
  return {
    url: config.webhookUrl,
    notify: (event) => deliver(send, event),
  };
}
