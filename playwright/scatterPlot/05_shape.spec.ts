import { test, expect } from '@chromatic-com/playwright';

test('no shape selected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('SingleSelectShape').locator('span[class*="InputPlaceholder-placeholder"]')).toBeVisible();
  await expect(page.getByLabel('Legend')).toBeDisabled();
  await expect(page.locator('g[class="legend"]')).not.toBeVisible();
});

test('shape selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectShape').click();
  await page.getByRole('option', { name: 'Breast Surgery Type' }).click();
  await expect(page.getByLabel('Legend')).not.toBeDisabled();
  await expect(page.locator('g[class="legend"]')).toBeVisible();
});
