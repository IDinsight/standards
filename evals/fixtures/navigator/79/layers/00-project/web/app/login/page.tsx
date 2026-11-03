import { signIn } from '@/lib/actions/auth';

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next = '/', error } = await searchParams;
  return (
    <main>
      <h1>Sign in</h1>
      {error ? <p role="alert">Email or password is incorrect.</p> : null}
      <form action={signIn}>
        <input type="hidden" name="next" value={next} />
        <label>
          Email <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password <input type="password" name="password" required autoComplete="current-password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
