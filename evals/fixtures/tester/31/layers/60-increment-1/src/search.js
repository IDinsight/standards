const byName = (left, right) => left.name.localeCompare(right.name);

export function searchUsers(users, query) {
  const needle = query.trim().toLowerCase();
  if (needle === '') return [];
  return users
    .filter((user) => user.name.toLowerCase().includes(needle))
    .map(({ id, name, email }) => ({ id, name, email }))
    .sort(byName);
}
