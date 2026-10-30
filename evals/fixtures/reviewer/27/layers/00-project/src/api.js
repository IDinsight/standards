import { ValidationError } from './fields.js';
import { internalView, publicView } from './tickets.js';

const forbidden = () => ({ status: 403, body: { error: 'forbidden' } });
const notFound = () => ({ status: 404, body: { error: 'not found' } });

function viewFor(caller, ticket) {
  return caller.staff ? internalView(ticket) : publicView(ticket);
}

function validated(run) {
  try {
    return run();
  } catch (error) {
    if (error instanceof ValidationError) return { status: 400, body: { error: error.message } };
    throw error;
  }
}

// Staff only: tickets are opened by support agents.
export function createTicketRoute(service, caller, body) {
  if (!caller.staff) return forbidden();
  return validated(() => ({ status: 201, body: internalView(service.create(body ?? {})) }));
}

export function getTicketRoute(service, caller, id) {
  const ticket = service.get(id);
  return ticket ? { status: 200, body: viewFor(caller, ticket) } : notFound();
}

// Staff only.
export function updateTicketRoute(service, caller, id, body) {
  if (!caller.staff) return forbidden();
  return validated(() => {
    const ticket = service.update(id, body ?? {});
    return ticket ? { status: 200, body: internalView(ticket) } : notFound();
  });
}
