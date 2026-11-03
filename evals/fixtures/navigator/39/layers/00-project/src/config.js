import { readFileSync } from 'node:fs';

import { resolveEndpoint } from './endpoints.js';

const DEFAULT_PATH = new URL('../config/service.json', import.meta.url);

export function loadConfig(path = DEFAULT_PATH, env = process.env) {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const name = env.RATES_ENDPOINT ?? raw.rates?.endpoint ?? 'rates-global';
  return {
    service: raw.service,
    syncIntervalMinutes: raw.syncIntervalMinutes ?? 15,
    rates: {
      endpointName: name,
      baseUrl: resolveEndpoint(name),
      token: env.RATES_API_TOKEN ?? raw.rates?.apiToken,
      timeoutMs: raw.rates?.timeoutMs ?? 5000,
    },
  };
}
