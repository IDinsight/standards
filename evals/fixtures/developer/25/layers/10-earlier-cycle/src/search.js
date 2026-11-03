export function searchUsers(users, query) {
  const needle = query.trim();
  if (needle === '') return [];
  return users.filter((user) => user.name.includes(needle));
}
