export function listHandler(store) {
  return () => ({
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(store.list()),
  });
}
