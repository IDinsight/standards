import { updateSiteSettings } from '@/lib/actions/admin';
import { pool } from '@/lib/db';

export default async function SettingsPage() {
  const { rows } = await pool.query('SELECT registration_open, support_email FROM settings WHERE id = 1');
  const settings = rows[0] ?? { registration_open: true, support_email: '' };
  return (
    <section>
      <h1>Settings</h1>
      <form action={updateSiteSettings}>
        <label>
          <input type="checkbox" name="registrationOpen" defaultChecked={settings.registration_open} />{' '}
          Registration open
        </label>
        <label>
          Support email{' '}
          <input type="email" name="supportEmail" defaultValue={settings.support_email} required />
        </label>
        <button type="submit">Save settings</button>
      </form>
    </section>
  );
}
