export class Memberships {
  constructor() {
    this.byWorkspace = new Map();
  }

  add(workspaceId, userId) {
    if (!this.byWorkspace.has(workspaceId)) this.byWorkspace.set(workspaceId, new Set());
    this.byWorkspace.get(workspaceId).add(userId);
  }

  isMember(workspaceId, userId) {
    return this.byWorkspace.get(workspaceId)?.has(userId) ?? false;
  }
}
