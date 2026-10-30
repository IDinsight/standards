import { parseDueAt } from './scheduler.js';

export function createApi({ store, scheduler }) {
  async function handle({ method, path, body = {} }) {
    if (method === 'GET' && path === '/reminders') {
      return { status: 200, body: store.list() };
    }
    if (method === 'POST' && path === '/reminders') {
      if (!body.to || !body.text) {
        return { status: 400, body: { error: 'to and text are required' } };
      }
      let dueAt;
      try {
        dueAt = parseDueAt(body.dueAt);
      } catch (error) {
        return { status: 400, body: { error: error.message } };
      }
      return { status: 201, body: store.add({ to: body.to, text: body.text, dueAt }) };
    }
    if (method === 'POST' && path === '/tick') {
      return { status: 200, body: { sent: await scheduler.tick() } };
    }
    return { status: 404, body: { error: 'not found' } };
  }

  return { handle };
}
