import { createServer } from 'node:http';

export function startServer(config, onEvent) {
  const server = createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/events') {
      res.writeHead(404).end();
      return;
    }
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let event;
      try {
        event = JSON.parse(body);
      } catch {
        res.writeHead(400).end();
        return;
      }
      res.writeHead(202).end();
      onEvent(event);
    });
  });
  return new Promise((resolve) => server.listen(config.port, () => resolve(server)));
}
