import { deliver } from './webhook.js';

export async function dispatch(endpoints, event, options) {
  const results = [];
  for (const endpoint of endpoints) {
    results.push({ url: endpoint.url, ...(await deliver(endpoint, event, options)) });
  }
  return results;
}
