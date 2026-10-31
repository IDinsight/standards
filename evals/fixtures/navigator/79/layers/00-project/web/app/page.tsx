import { registerForEvent } from '@/lib/actions/registrations';
import { listUpcomingEvents } from '@/lib/events';

export default async function HomePage() {
  const events = await listUpcomingEvents();
  return (
    <main>
      <h1>Upcoming events</h1>
      {events.length === 0 ? <p>No events scheduled yet.</p> : null}
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h2>{event.title}</h2>
            <p>
              {event.location} · {event.startsAt.toLocaleString('en-GB')}
            </p>
            <form action={registerForEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <button type="submit">Register</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
