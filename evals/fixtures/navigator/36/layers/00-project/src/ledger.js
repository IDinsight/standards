import { readFile } from 'node:fs/promises';

export async function loadLedger(file) {
  const parsed = JSON.parse(await readFile(file, 'utf8'));
  return parsed.entries ?? [];
}

export function balance(entries, account) {
  return entries
    .filter((entry) => entry.account === account)
    .reduce((sum, entry) => sum + (entry.type === 'credit' ? entry.amount : -entry.amount), 0);
}

export function accounts(entries) {
  return [...new Set(entries.map((entry) => entry.account))].sort();
}

export function summarize(entries) {
  return accounts(entries).map((account) => ({ account, balance: balance(entries, account) }));
}
