import { test, expect } from '@chromatic-com/playwright';

test('no shape selected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('SingleSelectShape').locator('span[class*="InputPlaceholder-placeholder"]').last()).toBeVisible();
});

test('shape selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectShape').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
  await expect(page.getByLabel('Legend')).not.toBeDisabled();
  expect(await page.locator('g[class="legend"]')).toBeVisible();
});
