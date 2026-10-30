import { loadConfig } from './config.js';
import { deliver } from './deliver.js';

export async function relayBatch(events, { send, config = loadConfig(), log = console.log }) {
  const results = [];
  for (const event of events) {
    const result = await deliver(event, { send, config });
    log(`${event.id} ${result.ok ? 'delivered' : 'failed'} status=${result.status} attempts=${result.attempts}`);
    results.push({ id: event.id, ...result });
  }
  return results;
}
