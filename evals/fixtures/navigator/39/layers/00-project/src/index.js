import { loadConfig } from './config.js';
import { createRatesClient } from './rates-client.js';

const SYMBOLS = ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'PLN'];

const config = loadConfig();
const client = createRatesClient(config.rates);

async function runOnce() {
  const data = await client.latest(SYMBOLS);
  const count = Object.keys(data.rates ?? {}).length;
  console.log(`[${config.service}] fetched ${count} rates from ${config.rates.endpointName}`);
}

await runOnce();
setInterval(() => {
  runOnce().catch((error) => console.error(`[${config.service}] ${error.message}`));
}, config.syncIntervalMinutes * 60_000);
