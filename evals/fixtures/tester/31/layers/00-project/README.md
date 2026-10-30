# staff-directory

Load staff records from a JSON file and look people up.

```js
import { findUserById, loadUsers } from './src/directory.js';

const users = loadUsers('data/users.json');
findUserById(users, 2); // { id: 2, name: 'Ada Lovelace', email: 'ada.lovelace@example.org' }
```

Run the tests with `npm test`.
