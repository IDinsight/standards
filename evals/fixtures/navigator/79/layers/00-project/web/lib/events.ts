import { pool } from './db';

export type EventSummary = {
  id: string;
  title: string;
  location: string;
  startsAt: Date;
  capacity: number;
};

export async function listUpcomingEvents(): Promise<EventSummary[]> {
  const { rows } = await pool.query(
    `SELECT id, title, location, starts_at, capacity
       FROM events
      WHERE starts_at > now()
      ORDER BY starts_at
      LIMIT 100`,
  );
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    location: row.location,
    startsAt: row.starts_at,
    capacity: row.capacity,
  }));
}
