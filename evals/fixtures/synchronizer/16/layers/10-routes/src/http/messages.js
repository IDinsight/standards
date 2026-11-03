// Requests are { method, path, query, user, body }; responses are
// { status, headers, body } with a string body.
export function json(status, data) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}
