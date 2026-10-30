import { newTicket, updateTicket } from './tickets.js';

export class TicketService {
  constructor() {
    this.tickets = new Map();
    this.lastId = 0;
  }

  create(input) {
    const ticket = newTicket(this.lastId + 1, input);
    this.lastId = ticket.id;
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  get(id) {
    return this.tickets.get(id) ?? null;
  }

  update(id, changes) {
    const current = this.get(id);
    if (!current) return null;
    const next = updateTicket(current, changes);
    this.tickets.set(id, next);
    return next;
  }
}
