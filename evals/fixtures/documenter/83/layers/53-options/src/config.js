// Settings for a ledgerline run. `loadConfig` merges the user's options over
// DEFAULTS and validates the result.
const DATE_FORMATS = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
const DELIMITERS = [',', ';', '\t'];

export const DEFAULTS = Object.freeze({
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  roundTo: 2,
  skipEmptyRows: true,
  delimiter: ',',
});

export function loadConfig(options = {}) {
  const config = { ...DEFAULTS };
  for (const [key, value] of Object.entries(options)) {
    if (!Object.hasOwn(DEFAULTS, key)) throw new Error(`Unknown option: ${key}`);
    config[key] = value;
  }
  if (typeof config.currency !== 'string' || !/^[A-Z]{3}$/.test(config.currency)) {
    throw new Error('currency must be a three-letter code such as USD');
  }
  if (!DATE_FORMATS.includes(config.dateFormat)) {
    throw new Error(`dateFormat must be one of ${DATE_FORMATS.join(', ')}`);
  }
  if (!Number.isInteger(config.roundTo) || config.roundTo < 0 || config.roundTo > 4) {
    throw new Error('roundTo must be a whole number from 0 to 4');
  }
  if (typeof config.skipEmptyRows !== 'boolean') {
    throw new Error('skipEmptyRows must be true or false');
  }
  if (!DELIMITERS.includes(config.delimiter)) {
    throw new Error('delimiter must be a comma, a semicolon, or a tab');
  }
  return config;
}
