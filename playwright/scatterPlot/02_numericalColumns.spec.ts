import { test, expect } from '@chromatic-com/playwright';

test('no and one numerical column selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('MultiSelect').first().click();
  await page.getByTestId('MultiSelectCloseButton').first().click();
  await expect(page.getByRole('alert')).toBeVisible();

  // select one column
  await page.getByTestId('MultiSelect').first().click();
  await page.getByRole('option', { name: 'Cohort' });
  await expect(page.getByRole('alert')).toBeVisible();
});

test('initial state: two numerical columns selected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('MultiSelect').locator('span[class*="Pill-root"]')).toHaveCount(2);
  await expect(page.locator('text[class="xtitle"]')).toHaveText('STAT2: Gene expression');
  await expect(page.locator('text[class="ytitle"]')).toHaveText('BRCA1: Gene expression');
});
