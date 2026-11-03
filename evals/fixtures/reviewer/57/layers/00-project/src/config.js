const DEFAULTS = { delimiter: ',', currency: 'USD', skipHeader: true };

// Command-line options win over the environment, which wins over DEFAULTS.
export function readConfig(argv, env = {}) {
  const config = { ...DEFAULTS, currency: env.LEDGER_CURRENCY || DEFAULTS.currency, input: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--delimiter') config.delimiter = argv[++i];
    else if (arg === '--currency') config.currency = argv[++i];
    else if (arg === '--no-header') config.skipHeader = false;
    else if (arg.startsWith('--')) throw new Error(`unknown option ${arg}`);
    else config.input = arg;
  }
  if (!config.input) throw new Error('missing input file');
  if (config.delimiter?.length !== 1) throw new Error('delimiter must be one character');
  return config;
}
