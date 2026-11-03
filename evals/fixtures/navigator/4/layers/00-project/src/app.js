import { createApi } from './api.js';
import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';
import { createScheduler } from './scheduler.js';
import { createStore } from './store.js';

export function createApp({ env = process.env, transport, now } = {}) {
  const config = loadConfig(env);
  const store = createStore();
  const mailer = createMailer({ from: config.from, transport });
  const scheduler = createScheduler({ store, mailer, maxBatch: config.maxBatch, now });
  const api = createApi({ store, scheduler });

  return {
    api,
    start() {
      scheduler.start(config.intervalMs);
    },
    stop() {
      scheduler.stop();
    },
  };
}
