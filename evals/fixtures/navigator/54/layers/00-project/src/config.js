import { readFile } from 'node:fs/promises';

export class ConfigError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ConfigError';
  }
}

export const DEFAULTS = Object.freeze({ host: '127.0.0.1', port: 8080, logLevel: 'info' });

const LEVELS = new Set(['debug', 'info', 'warn', 'error']);

export async function loadConfig(path) {
  let text;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return { ...DEFAULTS };
    throw new ConfigError(`Could not read ${path}`, { cause: error });
  }

  let raw;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new ConfigError(`${path} is not valid JSON`, { cause: error });
  }

  const config = { ...DEFAULTS, ...raw };
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new ConfigError(`port must be an integer from 1 to 65535, got ${JSON.stringify(config.port)}`);
  }
  if (!LEVELS.has(config.logLevel)) {
    config.logLevel = DEFAULTS.logLevel;
  }
  return config;
}
