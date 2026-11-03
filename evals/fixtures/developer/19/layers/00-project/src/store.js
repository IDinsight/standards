export class ClientStore {
  constructor(clients = []) {
    this.clients = new Map(clients.map((client) => [client.id, { ...client }]));
  }

  list({ includeArchived = false } = {}) {
    return [...this.clients.values()]
      .filter((client) => includeArchived || !client.archived)
      .sort((a, b) => a.id - b.id);
  }

  get(id) {
    return this.clients.get(id) ?? null;
  }

  remove(id) {
    return this.clients.delete(id);
  }
}
