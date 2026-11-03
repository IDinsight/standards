import { deactivateUser, setUserRole } from '@/lib/actions/admin';
import { pool } from '@/lib/db';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function UsersPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const { rows } = await pool.query(
    `SELECT id, name, email, role, active
       FROM users
      WHERE $1 = '' OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%'
      ORDER BY name
      LIMIT 200`,
    [q],
  );
  return (
    <section>
      <h1>Users</h1>
      <form>
        <input type="search" name="q" defaultValue={q} placeholder="Name or email" />
        <button type="submit">Search</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Access</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <form action={setUserRole}>
                  <input type="hidden" name="userId" value={user.id} />
                  <select name="role" defaultValue={user.role}>
                    <option value="volunteer">Volunteer</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit">Save</button>
                </form>
              </td>
              <td>
                {user.active ? (
                  <form action={deactivateUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button type="submit">Deactivate</button>
                  </form>
                ) : (
                  'Inactive'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
