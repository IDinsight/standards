// Find users whose name contains the query or whose email equals it.
export function searchUsers(users, query) {
  if (!query) return [];
  const email = query.toLowerCase();
  return users.filter((user) => user.name.includes(query) || user.email === email);
}
