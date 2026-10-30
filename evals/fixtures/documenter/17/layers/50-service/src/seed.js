import { readFileSync } from 'node:fs';

// Records loaded into the in-memory store when the service starts.
export const seedRecords = JSON.parse(readFileSync(new URL('../data/seed.json', import.meta.url), 'utf8'));
