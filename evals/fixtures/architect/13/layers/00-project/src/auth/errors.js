const KINDS = {
  missing_credentials: { status: 400, message: 'Email and password are required.' },
  invalid_credentials: { status: 401, message: 'Email or password is incorrect.' },
  token_missing: { status: 401, message: 'Sign in to continue.' },
  token_expired: { status: 401, message: 'Your session has expired. Sign in again.' },
  token_invalid: { status: 401, message: 'Your session is not valid. Sign in again.' },
};

export class AuthError extends Error {
  constructor(code) {
    const kind = KINDS[code];
    if (!kind) throw new TypeError('Unknown auth error code: ' + code);
    super(kind.message);
    this.name = 'AuthError';
    this.code = code;
    this.status = kind.status;
  }
}

export function toResponse(error) {
  return { status: error.status, headers: {}, body: { error: { code: error.code, message: error.message } } };
}

export const AUTH_ERROR_CODES = Object.keys(KINDS);
