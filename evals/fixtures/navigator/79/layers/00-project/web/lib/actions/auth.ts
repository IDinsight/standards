'use server';

import { scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { pool } from '@/lib/db';
import { SESSION_COOKIE, encodeSession } from '@/lib/session';

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const EIGHT_HOURS = 8 * 60 * 60 * 1000;

async function passwordMatches(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = await scryptAsync(password, Buffer.from(salt, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/');

  const { rows } = await pool.query(
    'SELECT id, email, name, role, password_hash FROM users WHERE email = $1 AND active',
    [email],
  );
  const user = rows[0];
  if (!user || !(await passwordMatches(password, user.password_hash))) {
    redirect('/login?error=1');
  }

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    encodeSession({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      expires: Date.now() + EIGHT_HOURS,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EIGHT_HOURS / 1000,
    },
  );
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/');
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}
