import { canEdit } from './visibility.js';

const STATUSES = ['open', 'pending', 'closed'];
const PRIORITIES = ['low', 'normal', 'high'];
const MAX_NOTE_LENGTH = 500;

export class TicketStore {
  constructor() {
    this.tickets = new Map();
    this.nextId = 1;
  }

  create({ subject }, now = new Date()) {
    const ticket = {
      id: this.nextId++,
      subject: String(subject).trim(),
      status: 'open',
      createdAt: now.toISOString(),
      assignee: null,
      priority: 'normal',
      internalNote: null,
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  get(id) {
    return this.tickets.get(id) ?? null;
  }

  update(id, changes, role) {
    const ticket = this.get(id);
    if (!ticket) throw new Error(`ticket ${id} not found`);
    for (const field of Object.keys(changes)) {
      if (!canEdit(role, field)) throw new Error(`${role} may not change ${field}`);
    }
    const updated = { ...ticket, ...normalize(changes) };
    this.tickets.set(id, updated);
    return updated;
  }
}

function normalize(changes) {
  const result = { ...changes };
  if ('subject' in result) result.subject = String(result.subject).trim();
  if ('status' in result && !STATUSES.includes(result.status)) {
    throw new Error(`unknown status ${result.status}`);
  }
  if ('priority' in result && !PRIORITIES.includes(result.priority)) {
    throw new Error(`unknown priority ${result.priority}`);
  }
  if ('internalNote' in result) result.internalNote = noteText(result.internalNote);
  return result;
}

function noteText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text.length > MAX_NOTE_LENGTH) {
    throw new Error(`internal note must be at most ${MAX_NOTE_LENGTH} characters`);
  }
  return text === '' ? null : text;
}
