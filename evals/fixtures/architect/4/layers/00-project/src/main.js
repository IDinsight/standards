import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 8080);
const app = createApp({ callbackSecret: process.env.CALLBACK_SECRET ?? 'dev-secret' });

app.server.listen(port, () => app.logger.info('listening', { port }));
