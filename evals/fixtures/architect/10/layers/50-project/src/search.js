// Returns the users whose name starts with the query.
export function searchUsers(users, query) {
  return users.filter((user) => user.name.startsWith(query));
}
