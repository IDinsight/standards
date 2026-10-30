import { ConfigError, loadConfig } from './config.js';

const path = process.argv[2] ?? 'config.json';

try {
  const config = await loadConfig(path);
  console.log(JSON.stringify(config, null, 2));
} catch (error) {
  if (!(error instanceof ConfigError)) throw error;
  console.error(`config: ${error.message}`);
  process.exitCode = 1;
}
