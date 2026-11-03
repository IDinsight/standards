import { sessionFromCookie } from './sessions.js';

// The signed-in staff member for a request, or null.
export function currentStaff(req) {
  const user = sessionFromCookie(req.headers?.cookie);
  return user && user.role === 'staff' ? user : null;
}
