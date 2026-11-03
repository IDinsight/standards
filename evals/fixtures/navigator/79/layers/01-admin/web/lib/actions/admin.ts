'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';

const ROLES = ['admin', 'coordinator', 'volunteer'] as const;

async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Not signed in');
  }
  return session.user;
}

async function logAdminAction(actorId: string, action: string, targetId: string, detail?: string) {
  await pool.query(
    'INSERT INTO admin_log (actor_id, action, target_id, detail) VALUES ($1, $2, $3, $4)',
    [actorId, action, targetId, detail ?? null],
  );
}

export async function setUserRole(formData: FormData) {
  const actor = await requireUser();
  const userId = String(formData.get('userId'));
  const role = String(formData.get('role'));
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    throw new Error('Unknown role');
  }
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
  await logAdminAction(actor.id, 'set_role', userId, role);
  revalidatePath('/admin/users');
}

export async function deactivateUser(formData: FormData) {
  const actor = await requireUser();
  const userId = String(formData.get('userId'));
  await pool.query('UPDATE users SET active = false WHERE id = $1', [userId]);
  await logAdminAction(actor.id, 'deactivate', userId);
  revalidatePath('/admin/users');
}

export async function deleteEvent(formData: FormData) {
  const actor = await requireUser();
  const eventId = String(formData.get('eventId'));
  await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
  await logAdminAction(actor.id, 'delete_event', eventId);
  revalidatePath('/admin/events');
  revalidatePath('/');
}

export async function updateSiteSettings(formData: FormData) {
  const actor = await requireUser();
  const registrationOpen = formData.get('registrationOpen') === 'on';
  const supportEmail = String(formData.get('supportEmail') ?? '').trim();
  if (!supportEmail.includes('@')) {
    throw new Error('Support email is required');
  }
  await pool.query(
    'UPDATE settings SET registration_open = $1, support_email = $2 WHERE id = 1',
    [registrationOpen, supportEmail],
  );
  await logAdminAction(actor.id, 'update_settings', 'settings', `open=${registrationOpen}`);
  revalidatePath('/admin/settings');
}
