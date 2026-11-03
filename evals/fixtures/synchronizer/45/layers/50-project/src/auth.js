export function isAdmin(user) {
  return Boolean(user) && user.role === 'admin';
}
