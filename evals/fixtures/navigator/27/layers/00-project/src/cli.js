import { loadConfig } from './config.js';
import { syncQuotes } from './sync.js';

const { quotes, timedOut } = await syncQuotes(loadConfig());
console.log(JSON.stringify(quotes, null, 2));
if (timedOut.length) console.error(`timed out: ${timedOut.join(', ')}`);
