// Structured log lines on stderr. LOG_LEVEL sets the starting threshold
// (default info); `silent` turns logging off.
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];

function levelFrom(value: string | undefined): LogLevel {
  return LEVELS.includes(value as LogLevel) ? (value as LogLevel) : 'info';
}

let threshold: LogLevel = levelFrom(process.env.LOG_LEVEL);

export function setLogLevel(level: LogLevel): void {
  threshold = level;
}

export function log(level: Exclude<LogLevel, 'silent'>, message: string, fields: Record<string, unknown> = {}): void {
  if (LEVELS.indexOf(level) < LEVELS.indexOf(threshold)) return;
  process.stderr.write(`${JSON.stringify({ at: new Date().toISOString(), level, message, ...fields })}\n`);
}
