import { expect, test } from '@playwright/test';

test('search narrows the article list', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search articles').fill('invoices');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('link', { name: 'Find past invoices' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reset your password' })).toHaveCount(0);
});

test('article page shows the article', async ({ page }) => {
  await page.goto('/articles/reset-password');
  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
});
