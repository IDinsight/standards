import { createDirectory } from './directory.js';
import { handleLookup } from './handler.js';

export function createApp() {
  const directory = createDirectory();
  return { lookup: (req) => handleLookup(req, { directory }) };
}
