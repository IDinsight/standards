import { deleteEvent } from '@/lib/actions/admin';
import { pool } from '@/lib/db';

export default async function AdminEventsPage() {
  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.starts_at, e.capacity,
            count(r.user_id) FILTER (WHERE r.status = 'confirmed')::int AS confirmed
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.id
      GROUP BY e.id
      ORDER BY e.starts_at DESC
      LIMIT 200`,
  );
  return (
    <section>
      <h1>Events</h1>
      <ul>
        {rows.map((event) => (
          <li key={event.id}>
            {event.title} ({event.confirmed}/{event.capacity}) ·{' '}
            {new Date(event.starts_at).toLocaleString('en-GB')}
            <form action={deleteEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
