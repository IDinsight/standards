export const DEFAULTS = Object.freeze({
  archiveDir: './archives',
  retentionDays: 30,
  compress: true,
});

export function loadConfig(overrides = {}) {
  const config = { ...DEFAULTS, ...overrides };
  if (!Number.isInteger(config.retentionDays) || config.retentionDays < 1) {
    throw new RangeError('retentionDays must be a positive integer');
  }
  if (typeof config.archiveDir !== 'string' || config.archiveDir === '') {
    throw new TypeError('archiveDir must be a non-empty string');
  }
  config.compress = Boolean(config.compress);
  return config;
}
