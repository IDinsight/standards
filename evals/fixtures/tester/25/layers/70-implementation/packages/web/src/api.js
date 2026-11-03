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

// Asks the service to export the records matching the filter. Resolves with the
// file name from the content-disposition header and the CSV text.
export async function exportRecords(filter, fetchImpl = fetch) {
  const response = await fetchImpl(`/api/records/export${filterQuery(filter)}`, { method: 'POST' });
  if (!response.ok) throw new Error(await errorMessage(response));
  const disposition = response.headers.get('content-disposition') ?? '';
  const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'records.csv';
  return { fileName, csv: await response.text() };
}
