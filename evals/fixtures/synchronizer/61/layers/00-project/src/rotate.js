import { existsSync, renameSync, rmSync, statSync } from 'node:fs';

export const DEFAULTS = Object.freeze({ maxBytes: 1048576, keep: 5 });

// True when the log exists and has reached maxBytes.
export function shouldRotate(file, options = {}) {
  const { maxBytes } = { ...DEFAULTS, ...options };
  if (!existsSync(file)) return false;
  return statSync(file).size >= maxBytes;
}

// Move file to file.1, shifting older backups up and dropping file.<keep>.
export function rotate(file, options = {}) {
  const { keep } = { ...DEFAULTS, ...options };
  if (!Number.isInteger(keep) || keep < 1) {
    throw new RangeError('keep must be a positive integer');
  }
  if (!existsSync(file)) return false;
  const oldest = file + '.' + keep;
  if (existsSync(oldest)) rmSync(oldest);
  for (let n = keep - 1; n >= 1; n -= 1) {
    const from = file + '.' + n;
    if (existsSync(from)) renameSync(from, file + '.' + (n + 1));
  }
  renameSync(file, file + '.1');
  return true;
}

export function rotateIfNeeded(file, options = {}) {
  return shouldRotate(file, options) ? rotate(file, options) : false;
}
