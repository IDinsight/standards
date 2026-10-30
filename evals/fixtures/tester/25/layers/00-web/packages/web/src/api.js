// Client for the records service API, which the page reaches under /api.

export function filterQuery(filter) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(filter)) {
    if (value) params.set(name, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

async function errorMessage(response) {
  try {
    const body = await response.json();
    if (body && typeof body.error === 'string') return body.error;
  } catch {
    // Not a JSON error body; fall back to the status.
  }
  return `request failed with status ${response.status}`;
}

export async function fetchRecords(filter, fetchImpl = fetch) {
  const response = await fetchImpl(`/api/records${filterQuery(filter)}`);
  if (!response.ok) throw new Error(await errorMessage(response));
  const body = await response.json();
  return body.records;
}
