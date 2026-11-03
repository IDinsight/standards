import { createApp } from './app.ts';
import { createHttpServer } from './http/server.ts';

const port = Number(process.env.PORT ?? 8080);

createHttpServer(createApp()).listen(port, () => {
  console.log(`records-admin listening on ${port}`);
});
