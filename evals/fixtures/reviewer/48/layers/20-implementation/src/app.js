import { createDirectory } from './directory.js';
import { handleLookup } from './handler.js';
import { createRateLimiter } from './rateLimiter.js';

export function createApp({ now = Date.now } = {}) {
  const directory = createDirectory();
  const limiter = createRateLimiter({ now });
  return { lookup: (req) => handleLookup(req, { directory, limiter }) };
}
