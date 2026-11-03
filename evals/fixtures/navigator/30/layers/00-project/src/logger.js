import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function createLogger(file) {
  let ready = false;
  function write(level, message) {
    const line = `${new Date().toISOString()} ${level} ${message}\n`;
    process.stdout.write(line);
    if (!ready) {
      mkdirSync(dirname(file), { recursive: true });
      ready = true;
    }
    appendFileSync(file, line);
  }
  return {
    info: (message) => write('INFO', message),
    warn: (message) => write('WARN', message),
    error: (message) => write('ERROR', message),
  };
}
