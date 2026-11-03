import { HttpError } from './auth.js';

// Wrap a handler so an HttpError becomes a { status, body } response.
export function handle(fn) {
  return (store, request) => {
    try {
      return fn(store, request);
    } catch (error) {
      if (error instanceof HttpError) return { status: error.status, body: { error: error.message } };
      throw error;
    }
  };
}
