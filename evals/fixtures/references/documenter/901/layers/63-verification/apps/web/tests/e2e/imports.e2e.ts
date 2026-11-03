import { expect, test } from '@playwright/test';

const job = { id: 'job-1', created_at: '2026-09-20T10:00:00Z' };

test('shows a pending import, then its failure', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('datahub.token', 'test-token'));
  await page.route('**/imports', (route) => route.fulfill({ status: 202, json: { ...job, status: 'pending', error: null } }));
  await page.route('**/imports/job-1', (route) =>
    route.fulfill({ json: { ...job, status: 'failed', error: 'file has no rows' } }),
  );
  await page.goto('/');
  await page.setInputFiles('input[type=file]', { name: 'rows.csv', mimeType: 'text/csv', buffer: Buffer.from('') });
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.locator('li.import-pending')).toContainText('Waiting');
  await expect(page.locator('li.import-failed')).toContainText('file has no rows');
});
