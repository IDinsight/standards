// Role checks for request handlers. `user` is the account the session layer
// attaches to each request.
export function isAdmin(user) {
  return Array.isArray(user?.roles) && user.roles.includes('admin');
}
