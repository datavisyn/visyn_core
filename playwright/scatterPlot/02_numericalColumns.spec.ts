import { test, expect } from '@playwright/test';

test('no and one numerical column selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('MultiSelect').click();
  await page.getByTestId('MultiSelectCloseButton').click();
  await expect(page.getByRole('alert')).toBeVisible();

  // select one column
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Cohort' });
  await expect(page.getByRole('alert')).toBeVisible();
});

test('initial state: two numerical columns selected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('MultiSelect').locator('span[class*="Pill-root"]')).toHaveCount(2);
  await expect(page.getByText('MYC: Gene expression')).toBeVisible();
  await expect(page.getByText('STAT2: Gene expression')).toBeVisible();
  await page.pause();
});
