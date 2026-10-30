import { normalize } from './normalize.js';

const byName = (left, right) => left.name.localeCompare(right.name);

export function searchUsers(users, query) {
  const needle = normalize(query);
  if (needle === '') return [];
  const nameMatches = [];
  const emailMatches = [];
  for (const { id, name, email } of users) {
    if (normalize(name).includes(needle)) nameMatches.push({ id, name, email, matchedOn: 'name' });
    else if (normalize(email).includes(needle)) emailMatches.push({ id, name, email, matchedOn: 'email' });
  }
  return [...nameMatches.sort(byName), ...emailMatches.sort(byName)];
}
