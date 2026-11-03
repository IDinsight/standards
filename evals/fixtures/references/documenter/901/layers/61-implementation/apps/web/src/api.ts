import type { components } from './schema.d.ts';

export type ImportJob = components['schemas']['ImportJob'];

const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function createImport(file: File, token: string, key: string): Promise<ImportJob> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${base}/imports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': key },
    body,
  });
  if (response.status !== 202) throw new Error(`upload failed with status ${response.status}`);
  return response.json();
}

export async function getImport(id: string, token: string): Promise<ImportJob> {
  const response = await fetch(`${base}/imports/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`status request failed with status ${response.status}`);
  return response.json();
}
