// Requests are plain objects: { method, path, query, user, body }.
// Responses are { status, headers, body } with a string body.
export function json(status, data) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}
