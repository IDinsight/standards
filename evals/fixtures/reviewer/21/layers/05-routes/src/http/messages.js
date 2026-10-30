// Requests are plain objects: { method: 'GET' | 'POST', path, query, user, body? },
// where query maps parameter names to strings and user is { id, name, role } or
// null. Responses are { status, headers, body } with a string body.
export function json(status, data) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}
