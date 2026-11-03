import { loadConfig } from './config.js';
import { deliver } from './delivery.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createWorker({ send, sleep = wait, env = process.env }) {
  const config = loadConfig(env);
  return {
    config,
    handle: (event) => deliver(event, {
      send,
      sleep,
      maxAttempts: config.maxAttempts,
      backoffMs: config.backoffMs,
    }),
  };
}
