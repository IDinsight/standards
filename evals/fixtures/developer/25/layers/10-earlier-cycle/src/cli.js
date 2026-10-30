import { searchUsers } from './search.js';
import { loadUsers } from './users.js';

const [query] = process.argv.slice(2);
const users = loadUsers(new URL('../data/users.json', import.meta.url));
const shown = query === undefined ? users : searchUsers(users, query);
for (const user of shown) console.log(`${user.name} <${user.email}>`);
