// In-memory data used by the handlers and tests.
// users:      { id, token, admin }
// workspaces: { id, name, ownerId, memberIds, guestIds }
// events:     { id, workspaceId, type, actorId, at } (at is an ISO 8601 UTC string)
export function createStore(seed = {}) {
  return {
    users: seed.users ?? [],
    workspaces: seed.workspaces ?? [],
    events: seed.events ?? [],
  };
}

export function findUserByToken(store, token) {
  return store.users.find((user) => user.token === token) ?? null;
}

export function findWorkspace(store, id) {
  return store.workspaces.find((workspace) => workspace.id === id) ?? null;
}
