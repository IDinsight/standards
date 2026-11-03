import { createApp } from './server.js';
import { loadUsers } from './users.js';

const users = loadUsers(new URL('../data/users.json', import.meta.url));
const port = Number(process.env.PORT ?? 3000);

createApp(users).listen(port, () => {
  console.log(`user-directory listening on ${port}`);
});
