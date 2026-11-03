import { validateMessage } from './validate.js';

const TRANSIENT_STATUSES = new Set([429, 502, 503, 504]);

export class InvalidMessageError extends Error {
  constructor(errors) {
    super('invalid message: ' + errors.join('; '));
    this.name = 'InvalidMessageError';
    this.errors = errors;
  }
}

export class SendError extends Error {
  constructor(status, attempts) {
    super('send failed with status ' + status + ' after ' + attempts + ' attempt(s)');
    this.name = 'SendError';
    this.status = status;
    this.attempts = attempts;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessage(transport, message, options = {}) {
  const { maxAttempts = 3, baseDelayMs = 200, sleep = wait } = options;
  const errors = validateMessage(message);
  if (errors.length > 0) throw new InvalidMessageError(errors);

  let status;
  for (let attempt = 0; attempt <= maxAttempts; attempt += 1) {
    const response = await transport.send(message);
    if (response.status < 300) return response;
    status = response.status;
    if (!TRANSIENT_STATUSES.has(status)) throw new SendError(status, attempt + 1);
    if (attempt < maxAttempts) await sleep(baseDelayMs * 2 ** attempt);
  }
  throw new SendError(status, maxAttempts);
}
