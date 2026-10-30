import { authenticate, requireAdmin } from '../auth.js';
import { handle } from '../handle.js';

const summary = ({ id, name }) => ({ id, name });

// GET /me/workspaces
export const listMyWorkspaces = handle((store, request) => {
  const user = authenticate(store, request.headers);
  const mine = store.workspaces.filter((workspace) => workspace.memberIds.includes(user.id));
  return { status: 200, body: mine.map(summary) };
});

// GET /admin/workspaces
export const listAllWorkspaces = handle((store, request) => {
  const user = authenticate(store, request.headers);
  requireAdmin(user);
  return { status: 200, body: store.workspaces.map(summary) };
});
