import { loadUsers } from './users.js';

const users = loadUsers(new URL('../data/users.json', import.meta.url));
for (const user of users) console.log(`${user.name} <${user.email}>`);
