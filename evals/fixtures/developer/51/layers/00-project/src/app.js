import { createStore } from './store.js';

function json(status, body) {
  return { status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export function createApp(store = createStore()) {
  return function handle({ method, url, body }) {
    const { pathname } = new URL(url, 'http://localhost');

    if (method === 'GET' && pathname === '/contacts') {
      return json(200, store.list());
    }

    const match = /^\/contacts\/(\d+)$/.exec(pathname);
    if (method === 'GET' && match) {
      const contact = store.get(Number(match[1]));
      return contact ? json(200, contact) : json(404, { error: 'not found' });
    }

    if (method === 'POST' && pathname === '/contacts') {
      let data;
      try {
        data = JSON.parse(body ?? '');
      } catch {
        return json(400, { error: 'invalid JSON' });
      }
      if (!data?.name || !data?.email) {
        return json(400, { error: 'name and email are required' });
      }
      return json(201, store.add(data));
    }

    return json(404, { error: 'not found' });
  };
}
