import { authenticate, HttpError } from '../auth.js';
import { handle } from '../handle.js';
import { findWorkspace } from '../store.js';

const PAGE_SIZE = 50;

// GET /workspaces/:id/activity?before=<ISO timestamp>
export const listWorkspaceActivity = handle((store, request) => {
  authenticate(store, request.headers);
  const workspace = findWorkspace(store, request.params.id);
  if (!workspace) throw new HttpError(404, 'workspace not found');
  const before = request.query?.before;
  const events = store.events
    .filter((event) => event.workspaceId === workspace.id && (!before || event.at < before))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, PAGE_SIZE);
  const next = events.length === PAGE_SIZE ? events[PAGE_SIZE - 1].at : null;
  return { status: 200, body: { events, next } };
});
