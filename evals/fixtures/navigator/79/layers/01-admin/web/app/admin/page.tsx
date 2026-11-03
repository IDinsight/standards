import { pool } from '@/lib/db';

export default async function AdminOverviewPage() {
  const [users, events, registrations] = await Promise.all([
    pool.query('SELECT count(*)::int AS n FROM users WHERE active'),
    pool.query('SELECT count(*)::int AS n FROM events WHERE starts_at > now()'),
    pool.query("SELECT count(*)::int AS n FROM registrations WHERE status = 'confirmed'"),
  ]);
  return (
    <section>
      <h1>Overview</h1>
      <ul>
        <li>Active users: {users.rows[0].n}</li>
        <li>Upcoming events: {events.rows[0].n}</li>
        <li>Confirmed registrations: {registrations.rows[0].n}</li>
      </ul>
    </section>
  );
}
