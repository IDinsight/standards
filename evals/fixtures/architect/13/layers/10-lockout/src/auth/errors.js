const KINDS = {
  missing_credentials: { status: 400, message: 'Email and password are required.' },
  invalid_credentials: { status: 401, message: 'Email or password is incorrect.' },
  account_locked: { status: 423, message: 'Too many failed sign-in attempts. Try again later.' },
  token_missing: { status: 401, message: 'Sign in to continue.' },
  token_expired: { status: 401, message: 'Your session has expired. Sign in again.' },
  token_invalid: { status: 401, message: 'Your session is not valid. Sign in again.' },
};

export class AuthError extends Error {
  constructor(code, details = {}) {
    const kind = KINDS[code];
    if (!kind) throw new TypeError('Unknown auth error code: ' + code);
    super(kind.message);
    this.name = 'AuthError';
    this.code = code;
    this.status = kind.status;
    this.details = details;
  }
}

export function toResponse(error) {
  const headers = {};
  const body = { error: { code: error.code, message: error.message } };
  if (error.details.retryAfterSeconds !== undefined) {
    headers['Retry-After'] = String(error.details.retryAfterSeconds);
    body.error.retryAfterSeconds = error.details.retryAfterSeconds;
  }
  return { status: error.status, headers, body };
}

export const AUTH_ERROR_CODES = Object.keys(KINDS);
