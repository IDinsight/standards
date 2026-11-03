import { cookies } from 'next/headers';

import { SESSION_COOKIE, decodeSession, type Session } from './session';

export async function auth(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
