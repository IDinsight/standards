export class HttpError extends Error {
  constructor(status, body) {
    super('HTTP ' + status);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export function httpTransport(baseUrl) {
  return async function send(method, path, body) {
    const response = await fetch(new URL(path, baseUrl), {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) throw new HttpError(response.status, text);
    return text ? JSON.parse(text) : null;
  };
}
