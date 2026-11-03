export class SignupStore {
  constructor() {
    this.rows = new Map();
    this.nextId = 1;
  }

  findByEmail(email) {
    for (const row of this.rows.values()) {
      if (row.email === email) return row;
    }
    return null;
  }

  insert({ name, email }) {
    const row = { id: this.nextId, name, email, createdAt: new Date().toISOString() };
    this.nextId += 1;
    this.rows.set(row.id, row);
    return row;
  }

  count() {
    return this.rows.size;
  }
}
