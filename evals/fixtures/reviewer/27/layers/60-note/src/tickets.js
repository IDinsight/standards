import { oneOf, optionalText, requiredText } from './fields.js';

export const PRIORITIES = ['low', 'normal', 'high'];
export const STATUSES = ['open', 'pending', 'closed'];

export function newTicket(id, input) {
  return {
    id,
    title: requiredText(input.title, 120, 'title'),
    priority: oneOf(input.priority, PRIORITIES, 'priority', 'normal'),
    status: 'open',
    assignee: optionalText(input.assignee, 64, 'assignee'),
    note: optionalText(input.note, 500, 'note'),
  };
}

export function updateTicket(ticket, changes) {
  const next = { ...ticket };
  if (changes.title !== undefined) next.title = requiredText(changes.title, 120, 'title');
  if (changes.priority !== undefined) next.priority = oneOf(changes.priority, PRIORITIES, 'priority');
  if (changes.status !== undefined) next.status = oneOf(changes.status, STATUSES, 'status');
  if ('assignee' in changes) next.assignee = optionalText(changes.assignee, 64, 'assignee');
  if ('note' in changes) next.note = optionalText(changes.note, 500, 'note');
  return next;
}

export function publicView(ticket) {
  return { id: ticket.id, title: ticket.title, priority: ticket.priority, status: ticket.status };
}

export function internalView(ticket) {
  return { ...publicView(ticket), assignee: ticket.assignee, note: ticket.note };
}
