'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function registerForEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const eventId = String(formData.get('eventId'));
  await pool.query(
    `INSERT INTO registrations (event_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'confirmed'`,
    [eventId, session.user.id],
  );
  revalidatePath('/');
}
