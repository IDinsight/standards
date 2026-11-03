import { authenticate, HttpError } from '../auth.js';
import { handle } from '../handle.js';
import { findWorkspace } from '../store.js';

// GET /workspaces/:id/activity
export const listWorkspaceActivity = handle((store, request) => {
  authenticate(store, request.headers);
  const workspace = findWorkspace(store, request.params.id);
  if (!workspace) throw new HttpError(404, 'workspace not found');
  const events = store.events
    .filter((event) => event.workspaceId === workspace.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  return { status: 200, body: events };
});
