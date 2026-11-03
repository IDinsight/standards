import { searchUsers } from './search.js';

export function handleSearch(users, params) {
  const query = params.get('q');
  if (query === null) return { status: 400, body: { error: 'missing q' } };
  const results = searchUsers(users, query).map(({ id, name, email }) => ({ id, name, email }));
  return { status: 200, body: { results } };
}
